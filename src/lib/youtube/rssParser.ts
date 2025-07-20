import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type { NewYoutubeVideo } from '../db/schema';

// RSS Feed URL for Grainydays channel
const RSS_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCx4MHIcTdwdcmJ5accSDlPA';

// Zod schema for RSS item with enhanced data extraction
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
		'media:thumbnail': z.array(
			z.object({
				$: z.object({
					url: z.string(),
					width: z.string(),
					height: z.string()
				})
			})
		),
		'media:content': z.array(
			z.object({
				$: z.object({
					url: z.string(),
					type: z.string(),
					width: z.string(),
					height: z.string(),
					duration: z.string().optional()
				})
			})
		).optional(),
		'media:community': z.object({
			'media:statistics': z.object({
				$: z.object({
					views: z.string().optional(),
					likes: z.string().optional()
				})
			}).optional()
		}).optional()
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

	// Manually construct objects to be validated by Zod
	const mappedEntries = entries.map((entry: any) => ({
		id: entry.id,
		title: entry.title,
		published: entry.published,
		updated: entry.updated,
		author: entry.author || { name: '', uri: '' },
		'media:group': {
			'media:title': entry['media:group']['media:title'],
			'media:description': entry['media:group']['media:description'],
			'media:thumbnail': Array.isArray(entry['media:group']['media:thumbnail']) 
				? entry['media:group']['media:thumbnail'] 
				: [entry['media:group']['media:thumbnail']],
			'media:content': entry['media:group']['media:content'] ? 
				(Array.isArray(entry['media:group']['media:content']) 
					? entry['media:group']['media:content'] 
					: [entry['media:group']['media:content']]) : undefined,
			'media:community': entry['media:group']['media:community'] || {}
		},
		'yt:videoId': entry['yt:videoId'],
		'yt:channelId': entry['yt:channelId'],
		'yt:duration': entry['yt:duration'],
		'yt:uploaded': entry['yt:uploaded']
	}));

	// Parse and validate the data
	const parsedData = RSSFeedSchema.parse({ feed: { entry: mappedEntries } });

	// Convert to our format - get ALL available videos (up to maxVideos limit)
	const videos: NewYoutubeVideo[] = parsedData.feed.entry
		.slice(0, maxVideos) // This will now get all available videos up to 100
		.map((entry) => {
			// Get the highest quality thumbnail available
			const thumbnails = entry['media:group']['media:thumbnail'];
			const bestThumbnail = thumbnails.reduce((best: any, current: any) => {
				const bestWidth = parseInt(best.$.width);
				const currentWidth = parseInt(current.$.width);
				return currentWidth > bestWidth ? current : best;
			}, thumbnails[0]);

			// Extract additional metadata
			const duration = entry['yt:duration'] || 
				(entry['media:group']['media:content']?.[0]?.$?.duration);
			
			const viewCount = entry['media:group']['media:community']?.['media:statistics']?.$?.views;
			const likeCount = entry['media:group']['media:community']?.['media:statistics']?.$?.likes;

			// Enhanced description with metadata
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
				id: extractVideoId(entry.id),
				title: entry['media:group']['media:title'],
				description: enhancedDescription,
				thumbnail: bestThumbnail?.$?.url || '',
				publishedAt: new Date(entry.published)
			};
		});

	console.log(`Parsed ${videos.length} videos from RSS feed`);
	return videos;
}

export function extractVideoId(url: string): string {
	// yt:video:_id_
	const idRegex = /(?<=yt:video:).*/;
	const idMatch = url.match(idRegex);
	if (idMatch) {
		return idMatch[0];
	}

	// Extract video ID from YouTube URL
	const match = url.match(/[?&]v=([^&]+)/);
	return match ? match[1] : url;
} 