import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type { NewYoutubeVideo } from '@/lib/db/schema';
import { getYoutubeThumbnailUrl } from '@/lib/youtube/thumbnailUrl';

const RSS_FEED_URL =
	'https://www.youtube.com/feeds/videos.xml?channel_id=UCx4MHIcTdwdcmJ5accSDlPA';

const RSSItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	published: z.string(),
	updated: z.string(),
	author: z.object({
		name: z.string(),
		uri: z.string()
	}),
	'media:group': z.object({
		'media:title': z.string(),
		'media:description': z.string(),
		'media:thumbnail': z.object({
			url: z.string(),
			width: z.string(),
			height: z.string()
		}),
		'media:content': z
			.object({
				url: z.string(),
				type: z.string(),
				width: z.string(),
				height: z.string(),
				duration: z.string().optional()
			})
			.optional(),
		'media:community': z
			.object({
				'media:statistics': z
					.object({
						views: z.string().optional(),
						likes: z.string().optional()
					})
					.optional()
			})
			.optional()
	}),
	'yt:videoId': z.string().optional(),
	'yt:channelId': z.string().optional(),
	'yt:duration': z.string().optional(),
	'yt:uploaded': z.string().optional()
});

const RSSFeedSchema = z.object({
	feed: z.object({
		entry: z.array(RSSItemSchema)
	})
});

export async function fetchRss(): Promise<string> {
	const response = await fetch(RSS_FEED_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
	}
	return await response.text();
}

export function parseRss(xmlText: string, maxVideos: number = 100): NewYoutubeVideo[] {
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: ''
	});
	const jsonObj = parser.parse(xmlText);

	const entries = jsonObj.feed.entry;

	const mappedEntries = entries.map((entry: Record<string, unknown>) => ({
		id: entry.id,
		title: entry.title,
		published: entry.published,
		updated: entry.updated,
		author: entry.author || { name: '', uri: '' },
		'media:group': {
			'media:title': (entry['media:group'] as Record<string, unknown>)['media:title'],
			'media:description': (entry['media:group'] as Record<string, unknown>)['media:description'],
			'media:thumbnail': (entry['media:group'] as Record<string, unknown>)['media:thumbnail'],
			'media:content': (entry['media:group'] as Record<string, unknown>)['media:content'],
			'media:community': (entry['media:group'] as Record<string, unknown>)['media:community'] || {}
		},
		'yt:videoId': entry['yt:videoId'],
		'yt:channelId': entry['yt:channelId'],
		'yt:duration': entry['yt:duration'],
		'yt:uploaded': entry['yt:uploaded']
	}));

	const parsedData = RSSFeedSchema.parse({ feed: { entry: mappedEntries } });

	const videos: NewYoutubeVideo[] = parsedData.feed.entry.slice(0, maxVideos).map((entry) => {
		const videoId = extractVideoId(entry.id);
		const duration =
			entry['yt:duration'] || entry['media:group']['media:content']?.duration;
		const viewCount = entry['media:group']['media:community']?.['media:statistics']?.views;
		const likeCount = entry['media:group']['media:community']?.['media:statistics']?.likes;

		let enhancedDescription = entry['media:group']['media:description'];
		if (duration) {
			enhancedDescription += `\n\nDuration: ${duration}`;
		}
		if (viewCount) {
			enhancedDescription += `\nViews: ${parseInt(viewCount).toLocaleString()}`;
		}
		if (likeCount) {
			enhancedDescription += `\nLikes: ${parseInt(likeCount).toLocaleString()}`;
		}

		return {
			id: videoId,
			title: entry['media:group']['media:title'],
			description: enhancedDescription,
			thumbnail: getYoutubeThumbnailUrl(videoId),
			publishedAt: new Date(entry.published)
		};
	});

	return videos;
}

export function extractVideoId(url: string): string {
	const idRegex = /(?<=yt:video:).*/;
	const idMatch = url.match(idRegex);
	if (idMatch) {
		return idMatch[0];
	}
	const match = url.match(/[?&]v=([^&]+)/);
	return match ? match[1] : url;
}
