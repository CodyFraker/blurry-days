import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { calculateEffectiveDrink } from '$lib/rules/ruleEngine';
import { eq, and, gte } from 'drizzle-orm';
import { CategoryEnum, DrinkEnum } from '$lib/db/schema';

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({ error: 'Game ID is required' }, { status: 400 });
		}

		const body = await request.json();
		const { text, category, baseDrink } = body;

		// Validate input
		if (!text || !category || baseDrink === undefined) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate category
		if (!Object.values(CategoryEnum).includes(category)) {
			return json({ error: 'Invalid category' }, { status: 400 });
		}

		// Validate drink level
		if (!Object.values(DrinkEnum).includes(baseDrink)) {
			return json({ error: 'Invalid drink level' }, { status: 400 });
		}

		// Check if game exists and is active
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

		// Get current rules to determine order
		const currentRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		const newOrder = currentRules.length + 1;
		const effectiveDrink = calculateEffectiveDrink(baseDrink, game.intoxicationLevel);

		// Insert custom rule
		const newRule = await db.insert(rules).values({
			gameId: id,
			text,
			category,
			weight: 1.0, // Custom rules have full weight
			baseDrink: effectiveDrink,
			isCustom: true,
			order: newOrder
		}).returning();

		return json({
			rule: {
				id: newRule[0].id,
				text: newRule[0].text,
				category: newRule[0].category,
				baseDrink: newRule[0].baseDrink,
				order: newRule[0].order,
				isCustom: newRule[0].isCustom
			}
		});

	} catch (error) {
		console.error('Error adding custom rule:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({ error: 'Game ID is required' }, { status: 400 });
		}

		const body = await request.json();
		const { ruleId } = body;

		if (!ruleId) {
			return json({ error: 'Rule ID is required' }, { status: 400 });
		}

		// Check if game exists and is active
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

		// Delete the rule
		await db
			.delete(rules)
			.where(
				and(
					eq(rules.id, ruleId),
					eq(rules.gameId, id)
				)
			);

		// Reorder remaining rules
		const remainingRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		// Update order for remaining rules
		for (let i = 0; i < remainingRules.length; i++) {
			await db
				.update(rules)
				.set({ order: i + 1 })
				.where(eq(rules.id, remainingRules[i].id));
		}

		return json({ success: true });

	} catch (error) {
		console.error('Error deleting rule:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 