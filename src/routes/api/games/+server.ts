import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { selectRules, calculateEffectiveDrink } from '$lib/rules/ruleEngine';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { title, videoId, videoTitle, videoThumbnail, intoxicationLevel, rules: gameRules } = body;

		// Validate input
		if (!videoId || !videoTitle || intoxicationLevel === undefined || !gameRules || !Array.isArray(gameRules)) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Generate game ID
		const gameId = uuidv4();

		// Set expiration date (90 days from now)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		// Create game record
		const newGame = await db.insert(games).values({
			id: gameId,
			title: title || `${videoTitle} Drinking Game`,
			videoId,
			videoTitle,
			videoThumbnail,
			intoxicationLevel,
			expiresAt
		}).returning();

		// Insert rules into database
		const rulePromises = gameRules.map((rule: any, index: number) => {
			return db.insert(rules).values({
				gameId,
				text: rule.text,
				category: rule.category,
				weight: rule.weight || 1.0,
				baseDrink: rule.baseDrink,
				isCustom: rule.isCustom || false,
				order: index + 1
			});
		});

		const insertedRules = await Promise.all(rulePromises);

		// Fetch the created rules to return them
		const createdRules = await db.select().from(rules).where(eq(rules.gameId, gameId)).orderBy(rules.order);

		return json({
			game: {
				id: gameId,
				title: newGame[0].title,
				videoTitle,
				videoThumbnail,
				intoxicationLevel,
				expiresAt: newGame[0].expiresAt
			},
			rules: createdRules
		});

	} catch (error) {
		console.error('Error creating game:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 