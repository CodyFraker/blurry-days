import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, rules } from '@/lib/db/schema';
import {
	selectRules,
	calculateEffectiveDrink,
	substituteHostInRuleText
} from '@/lib/rules/ruleEngine';
import { incrementRuleTemplateUsage } from '@/lib/rules/incrementTemplateUsage';
import { eq, and } from 'drizzle-orm';
import { playableGameFilter } from '@/lib/games/gameVisibility';

export async function POST(
	_request: Request,
	context: { params: Promise<{ id: string; ruleId: string }> }
) {
	try {
		const { id, ruleId } = await context.params;

		if (!id || !ruleId) {
			return NextResponse.json({ error: 'Game ID and Rule ID are required' }, { status: 400 });
		}

		const gameResult = await db
			.select()
			.from(games)
			.where(
				and(eq(games.id, id), playableGameFilter())
			)
			.limit(1);

		if (gameResult.length === 0) {
			return NextResponse.json({ error: 'Game not found or expired' }, { status: 404 });
		}

		const game = gameResult[0];

		const ruleResult = await db
			.select()
			.from(rules)
			.where(
				and(eq(rules.id, ruleId), eq(rules.gameId, id), eq(rules.isCustom, false))
			)
			.limit(1);

		if (ruleResult.length === 0) {
			return NextResponse.json({ error: 'Rule not found or is custom' }, { status: 404 });
		}

		const newRules = await selectRules(game.intoxicationLevel, 1);
		if (newRules.length === 0) {
			return NextResponse.json({ error: 'Failed to generate new rule' }, { status: 500 });
		}

		const newRule = newRules[0];
		const effectiveDrink = calculateEffectiveDrink(newRule.baseDrink, game.intoxicationLevel);

		const updatedRule = await db
			.update(rules)
			.set({
				ruleTemplateId: newRule.id,
				text: substituteHostInRuleText(newRule.text, game.videoTitle),
				category: newRule.category,
				weight: newRule.weight,
				baseDrink: effectiveDrink
			})
			.where(eq(rules.id, ruleId))
			.returning();

		await incrementRuleTemplateUsage([newRule.id]);

		return NextResponse.json({
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
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
