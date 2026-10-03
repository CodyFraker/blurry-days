import { db } from '@/lib/db';
import { games, youtubeVideos, type YoutubeVideo } from '@/lib/db/schema';
import { fetchRss, parseRss } from '@/lib/youtube/rssParser';
import { and, asc, desc, eq, gte, or, sql } from 'drizzle-orm';

const DEFAULT_CACHE_MINUTES = 60;

export function getVideoSyncCacheMinutes(): number {
	const raw = process.env.VIDEO_SYNC_CACHE_MINUTES;
	if (!raw) {
		return DEFAULT_CACHE_MINUTES;
	}
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed < 0) {
		return DEFAULT_CACHE_MINUTES;
	}
	return parsed;
}

export function shouldRefreshFromCache(
	latestLastFetched: Date | null | undefined,
	now: Date,
	cacheMinutes: number
): boolean {
	if (!latestLastFetched || cacheMinutes === 0) {
		return false;
	}
	const elapsedMinutes = (now.getTime() - new Date(latestLastFetched).getTime()) / (1000 * 60);
	return elapsedMinutes < cacheMinutes;
}

export interface VideoWithGameCount extends YoutubeVideo {
	gameCount: number;
}

async function queryVideos(options: {
	includeHidden: boolean;
	now?: Date;
}): Promise<VideoWithGameCount[]> {
	const now = options.now ?? new Date();
	const hiddenFilter = options.includeHidden ? undefined : eq(youtubeVideos.isHidden, false);
	const playableGamesJoin = and(
		eq(youtubeVideos.id, games.videoId),
		eq(games.isActive, true),
		or(eq(games.expiresNever, true), gte(games.expiresAt, now))
	);

	const rows = await db
		.select({
			id: youtubeVideos.id,
			title: youtubeVideos.title,
			thumbnail: youtubeVideos.thumbnail,
			publishedAt: youtubeVideos.publishedAt,
			description: youtubeVideos.description,
			lastFetched: youtubeVideos.lastFetched,
			isHidden: youtubeVideos.isHidden,
			sortOrder: youtubeVideos.sortOrder,
			gameCount: sql<number>`count(${games.id})`.mapWith(Number)
		})
		.from(youtubeVideos)
		.leftJoin(games, playableGamesJoin)
		.where(hiddenFilter)
		.groupBy(youtubeVideos.id)
		.orderBy(sql`${youtubeVideos.sortOrder} asc nulls last`, desc(youtubeVideos.publishedAt))
		.limit(100);

	return rows.map((row) => ({
		...row,
		sortOrder: row.sortOrder ?? null
	}));
}

export async function syncChannelVideos(options: {
	force?: boolean;
	includeHidden?: boolean;
	now?: Date;
}): Promise<{ videos: VideoWithGameCount[]; syncedAt: Date; fromCache: boolean }> {
	const now = options.now ?? new Date();
	const includeHidden = options.includeHidden ?? false;
	const cacheMinutes = getVideoSyncCacheMinutes();

	const latestVideo = await db.query.youtubeVideos.findFirst({
		orderBy: [desc(youtubeVideos.lastFetched)]
	});

	const fromCache =
		!options.force && shouldRefreshFromCache(latestVideo?.lastFetched, now, cacheMinutes);

	if (!fromCache) {
		const xmlText = await fetchRss();
		const parsedVideos = parseRss(xmlText);

		if (parsedVideos.length > 0) {
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
						lastFetched: now
					}
				});
		}
	}

	const videos = await queryVideos({ includeHidden });
	return { videos, syncedAt: now, fromCache };
}

export async function getLatestVideoSyncTime(): Promise<Date | null> {
	const latest = await db.query.youtubeVideos.findFirst({
		orderBy: [desc(youtubeVideos.lastFetched)],
		columns: { lastFetched: true }
	});
	return latest?.lastFetched ?? null;
}
