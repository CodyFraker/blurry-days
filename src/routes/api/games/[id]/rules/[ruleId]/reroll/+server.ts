import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { games, rules } from '$lib/db/schema';
import { selectRules, calculateEffectiveDrink } from '$lib/rules/ruleEngine';
import { eq, and, gte } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const { id, ruleId } = params;

		if (!id || !ruleId) {
			return json({ error: 'Game ID and Rule ID are required' }, { status: 400 });
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

		// Check if the rule exists and is not custom
		const ruleResult = await db
			.select()
			.from(rules)
			.where(
				and(
					eq(rules.id, ruleId),
					eq(rules.gameId, id),
					eq(rules.isCustom, false)
				)
			)
			.limit(1);

		if (ruleResult.length === 0) {
			return json({ error: 'Rule not found or is custom' }, { status: 404 });
		}

		const oldRule = ruleResult[0];

		// Generate a new rule to replace the old one
		const newRules = selectRules(game.intoxicationLevel, 1);
		if (newRules.length === 0) {
			return json({ error: 'Failed to generate new rule' }, { status: 500 });
		}

		const newRule = newRules[0];
		const effectiveDrink = calculateEffectiveDrink(newRule.baseDrink, game.intoxicationLevel);

		// Update the rule
		const updatedRule = await db
			.update(rules)
			.set({
				text: newRule.text,
				category: newRule.category,
				weight: newRule.weight,
				baseDrink: effectiveDrink
			})
			.where(eq(rules.id, ruleId))
			.returning();

		return json({
			rule: {
				id: updatedRule[0].id,
				text: updatedRule[0].text,
				category: updatedRule[0].category,
				baseDrink: updatedRule[0].baseDrink,
				order: updatedRule[0].order,
				isCustom: updatedRule[0].isCustom
			}
		});

	} catch (error) {
		console.error('Error re-rolling single rule:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}; 