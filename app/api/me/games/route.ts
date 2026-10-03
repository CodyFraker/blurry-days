import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { playableGameFilter } from '@/lib/games/gameVisibility';

export async function GET() {
	const sessionResult = await requireSession();
	if ('response' in sessionResult) {
		return sessionResult.response;
	}

	const { user } = sessionResult;

	const userGames = await db
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
		.where(and(eq(games.userId, user.id), playableGameFilter()))
		.orderBy(desc(games.createdAt));

	return NextResponse.json({ games: userGames });
}
