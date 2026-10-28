import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { playableGameFilter } from '@/lib/games/gameVisibility';
import { GAME_EDIT_TOKEN_HEADER, verifyEditToken } from '@/lib/games/editToken';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function requireGameEdit(
	request: Request,
	gameId: string
): Promise<
	| { game: typeof games.$inferSelect }
	| { response: NextResponse }
> {
	const gameResult = await db
		.select()
		.from(games)
		.where(and(eq(games.id, gameId), playableGameFilter()))
		.limit(1);

	if (gameResult.length === 0) {
		return {
			response: NextResponse.json({ error: 'Game not found or expired' }, { status: 404 })
		};
	}

	const game = gameResult[0];

	if (!game.editTokenHash) {
		return {
			response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		};
	}

	const token = request.headers.get(GAME_EDIT_TOKEN_HEADER);
	if (!verifyEditToken(game.editTokenHash, token)) {
		return {
			response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		};
	}

	return { game };
}
