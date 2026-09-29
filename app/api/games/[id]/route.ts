import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, rules } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

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
			.where(
				and(eq(games.id, id), eq(games.isActive, true), gte(games.expiresAt, new Date()))
			)
			.limit(1);

		if (gameResult.length === 0) {
			return NextResponse.json({ error: 'Game not found or expired' }, { status: 404 });
		}

		const game = gameResult[0];

		const rulesResult = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		return NextResponse.json({
			game: {
				id: game.id,
				title: game.title,
				videoTitle: game.videoTitle,
				videoThumbnail: game.videoThumbnail,
				intoxicationLevel: game.intoxicationLevel,
				expiresAt: game.expiresAt
			},
			rules: rulesResult.map((rule) => ({
				id: rule.id,
				text: rule.text,
				category: rule.category,
				baseDrink: rule.baseDrink,
				order: rule.order,
				isCustom: rule.isCustom
			}))
		});
	} catch (error) {
		console.error('Error fetching game:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
