import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getPlayableGameRules } from '@/lib/games/getPlayableGameRules';
import { playableGameFilter } from '@/lib/games/gameVisibility';

/**
 * GET /api/games/[id]
 * Returns a playable game and its rules by id. Each rule includes live template `description` when linked to a catalog template.
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
		}

		const gameResult = await db
			.select()
			.from(games)
			.where(and(eq(games.id, id), playableGameFilter()))
			.limit(1);

		if (gameResult.length === 0) {
			return NextResponse.json({ error: 'Game not found or expired' }, { status: 404 });
		}

		const game = gameResult[0];

		const rulesResult = await getPlayableGameRules(id);

		return NextResponse.json({
			game: {
				id: game.id,
				title: game.title,
				videoId: game.videoId,
				videoTitle: game.videoTitle,
				videoThumbnail: game.videoThumbnail,
				intoxicationLevel: game.intoxicationLevel,
				expiresAt: game.expiresAt
			},
			rules: rulesResult
		});
	} catch (error) {
		console.error('Error fetching game:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
