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
				and(eq(games.id, id), playableGameFilter())
			)
			.limit(1);

		if (gameResult.length === 0) {
			return NextResponse.json({ error: 'Game not found or expired' }, { status: 404 });
		}

		const game = gameResult[0];

		await db
			.delete(rules)
			.where(and(eq(rules.gameId, id), eq(rules.isCustom, false)));

		const selectedRules = await selectRules(game.intoxicationLevel, 5);

		const customRules = await db
			.select()
			.from(rules)
			.where(and(eq(rules.gameId, id), eq(rules.isCustom, true)))
			.orderBy(rules.order);

		await Promise.all(
			selectedRules.map((rule, index) => {
				const effectiveDrink = calculateEffectiveDrink(rule.baseDrink, game.intoxicationLevel);
				return db.insert(rules).values({
					gameId: id,
					ruleTemplateId: rule.id,
					text: substituteHostInRuleText(rule.text, game.videoTitle),
					category: rule.category,
					weight: rule.weight,
					baseDrink: effectiveDrink,
					isCustom: false,
					order: customRules.length + index + 1
				});
			})
		);

		await incrementRuleTemplateUsage(selectedRules.map((rule) => rule.id));

		const updatedRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		return NextResponse.json({
			rules: updatedRules.map((rule) => ({
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
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
