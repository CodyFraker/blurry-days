import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { selectRules, calculateEffectiveDrink } from '$lib/rules/ruleEngine';
import { eq, and, gte } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			return json({ error: 'Game ID is required' }, { status: 400 });
		}

		// Fetch game to get intoxication level
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

		// Delete existing rules (except custom ones)
		await db
			.delete(rules)
			.where(
				and(
					eq(rules.gameId, id),
					eq(rules.isCustom, false)
				)
			);

		// Generate new rules
		const selectedRules = selectRules(game.intoxicationLevel, 5);

		// Get current custom rules to preserve their order
		const customRules = await db
			.select()
			.from(rules)
			.where(
				and(
					eq(rules.gameId, id),
					eq(rules.isCustom, true)
				)
			)
			.orderBy(rules.order);

		// Insert new rules
		const rulePromises = selectedRules.map((rule, index) => {
			const effectiveDrink = calculateEffectiveDrink(rule.baseDrink, game.intoxicationLevel);
			return db.insert(rules).values({
				gameId: id,
				text: rule.text,
				category: rule.category,
				weight: rule.weight,
				baseDrink: effectiveDrink,
				isCustom: false,
				order: customRules.length + index + 1 // Start after custom rules
			});
		});

		await Promise.all(rulePromises);

		// Fetch updated rules
		const updatedRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		return json({
			rules: updatedRules.map(rule => ({
				id: rule.id,
				text: rule.text,
				category: rule.category,
				baseDrink: rule.baseDrink,
				order: rule.order,
				isCustom: rule.isCustom
			}))
		});

	} catch (error) {
		console.error('Error re-rolling rules:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 