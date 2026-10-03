import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { playableGameFilter } from '@/lib/games/gameVisibility';

export type PlayableGameSummary = {
	id: string;
	title: string;
	videoTitle: string;
	videoThumbnail: string | null;
};

export async function getPlayableGame(id: string): Promise<PlayableGameSummary | null> {
	const gameResult = await db
		.select({
			id: games.id,
			title: games.title,
			videoTitle: games.videoTitle,
			videoThumbnail: games.videoThumbnail
		})
		.from(games)
		.where(and(eq(games.id, id), playableGameFilter()))
		.limit(1);

	if (gameResult.length === 0) {
		return null;
	}

	return gameResult[0];
}
