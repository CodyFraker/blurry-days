import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { games, youtubeVideos, type YoutubeVideo } from '$lib/db/schema';
import { fetchRss, parseRss } from '$lib/youtube/rssParser';
import { desc, sql, eq, count } from 'drizzle-orm';

const CACHE_DURATION_MINUTES = 60;

interface VideoWithGameCount extends YoutubeVideo {
	gameCount: number;
}

export async function GET() {
	try {
		const latestVideo = await db.query.youtubeVideos.findFirst({
			orderBy: [desc(youtubeVideos.lastFetched)]
		});

		const now = new Date();
		let videos: VideoWithGameCount[] = [];

		const getVideosWithGameCount = async (): Promise<VideoWithGameCount[]> => {
			const rows = await db
				.select({
					id: youtubeVideos.id,
					title: youtubeVideos.title,
					thumbnail: youtubeVideos.thumbnail,
					publishedAt: youtubeVideos.publishedAt,
					description: youtubeVideos.description,
					lastFetched: youtubeVideos.lastFetched,
					gameCount: sql<number>`count(${games.id})`.mapWith(Number)
				})
				.from(youtubeVideos)
				.leftJoin(games, eq(youtubeVideos.id, games.videoId))
				.groupBy(youtubeVideos.id)
				.orderBy(desc(youtubeVideos.publishedAt))
				.limit(100); // Increased to handle more videos

			return rows;
		};

		if (
			latestVideo &&
			(now.getTime() - new Date(latestVideo.lastFetched).getTime()) / (1000 * 60) <
				CACHE_DURATION_MINUTES
		) {
			// Cache is fresh, return videos from DB
			videos = await getVideosWithGameCount();
			console.log(`Returning ${videos.length} videos from cache`);
		} else {
			// Cache is stale or empty, fetch from RSS feed
			const xmlText = await fetchRss();
			const parsedVideos = parseRss(xmlText);

			console.log(`Fetched ${parsedVideos.length} videos from RSS feed`);

			if (parsedVideos.length > 0) {
				// Use onConflictDoUpdate to insert new videos or update existing ones
				await db
					.insert(youtubeVideos)
					.values(parsedVideos)
					.onConflictDoUpdate({
						target: youtubeVideos.id,
						set: {
							title: sql`excluded.title`,
							thumbnail: sql`excluded.thumbnail`,
							publishedAt: sql`excluded.published_at`,
							description: sql`excluded.description`,
							lastFetched: new Date()
						}
					});
			}

			videos = await getVideosWithGameCount();
			console.log(`Returning ${videos.length} videos from database`);
		}

		return json(videos);
	} catch (error) {
		console.error('Error in /api/videos:', error);
		return json({ error: 'Failed to fetch videos' }, { status: 500 });
	}
} 