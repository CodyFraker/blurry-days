import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';

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
		.where(
			and(
				eq(games.userId, user.id),
				eq(games.isActive, true),
				gte(games.expiresAt, new Date())
			)
		)
		.orderBy(desc(games.createdAt));

	return NextResponse.json({ games: userGames });
}
