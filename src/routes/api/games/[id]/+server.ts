import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({ error: 'Game ID is required' }, { status: 400 });
		}

		// Fetch game with expiration check
		const gameResult = await db
			.select()
			.from(games)
			.where(
				and(
					eq(games.id, id),
					eq(games.isActive, true),
					gte(games.expiresAt, new Date())
				)
			)
			.limit(1);

		if (gameResult.length === 0) {
			return json({ error: 'Game not found or expired' }, { status: 404 });
		}

		const game = gameResult[0];

		// Fetch rules for the game
		const rulesResult = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		return json({
			game: {
				id: game.id,
				title: game.title,
				videoTitle: game.videoTitle,
				videoThumbnail: game.videoThumbnail,
				intoxicationLevel: game.intoxicationLevel,
				expiresAt: game.expiresAt
			},
			rules: rulesResult.map(rule => ({
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
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 