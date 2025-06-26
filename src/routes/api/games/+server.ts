import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { selectRules, calculateEffectiveDrink } from '$lib/rules/ruleEngine';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { videoId, videoTitle, videoThumbnail, intoxicationLevel } = body;

		// Validate input
		if (!videoId || !videoTitle || intoxicationLevel === undefined) {
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
			title: `Drinking Game - ${videoTitle}`,
			videoId,
			videoTitle,
			videoThumbnail,
			intoxicationLevel,
			expiresAt
		}).returning();

		// Generate rules
		const selectedRules = selectRules(intoxicationLevel, 5);

		// Insert rules into database
		const rulePromises = selectedRules.map((rule, index) => {
			const effectiveDrink = calculateEffectiveDrink(rule.baseDrink, intoxicationLevel);
			return db.insert(rules).values({
				gameId,
				text: rule.text,
				category: rule.category,
				weight: rule.weight,
				baseDrink: effectiveDrink,
				isCustom: false,
				order: index + 1
			});
		});

		await Promise.all(rulePromises);

		return json({
			id: gameId,
			title: newGame[0].title,
			videoTitle,
			videoThumbnail,
			intoxicationLevel,
			expiresAt: newGame[0].expiresAt
		});

	} catch (error) {
		console.error('Error creating game:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 