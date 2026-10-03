import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { games, youtubeVideos } from '@/lib/db/schema';
import { playableGameFilter } from '@/lib/games/gameVisibility';

export async function listPlayableGamesForVideo(videoId: string) {
	const video = await db.query.youtubeVideos.findFirst({
		where: eq(youtubeVideos.id, videoId),
		columns: {
			id: true,
			title: true,
			thumbnail: true,
			isHidden: true
		}
	});

	if (!video || video.isHidden) {
		return null;
	}

	const rows = await db
		.select({
			id: games.id,
			title: games.title,
			videoTitle: games.videoTitle,
			videoThumbnail: games.videoThumbnail,
			intoxicationLevel: games.intoxicationLevel,
			createdAt: games.createdAt,
			expiresAt: games.expiresAt
		})
		.from(games)
		.where(and(eq(games.videoId, videoId), playableGameFilter()))
		.orderBy(desc(games.createdAt));

	return {
		video: {
			id: video.id,
			title: video.title,
			thumbnail: video.thumbnail
		},
		games: rows
	};
}
