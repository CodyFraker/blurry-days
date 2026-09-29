import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, rules, CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { calculateEffectiveDrink } from '@/lib/rules/ruleEngine';
import { eq, and, gte } from 'drizzle-orm';

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
		}

		const body = await request.json();
		const { text, category, baseDrink } = body;

		if (!text || !category || baseDrink === undefined) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (!Object.values(CategoryEnum).includes(category)) {
			return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
		}

		if (!Object.values(DrinkEnum).includes(baseDrink)) {
			return NextResponse.json({ error: 'Invalid drink level' }, { status: 400 });
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

		const currentRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		const newOrder = currentRules.length + 1;
		const effectiveDrink = calculateEffectiveDrink(baseDrink, game.intoxicationLevel);

		const newRule = await db
			.insert(rules)
			.values({
				gameId: id,
				text,
				category,
				weight: 1.0,
				baseDrink: effectiveDrink,
				isCustom: true,
				order: newOrder
			})
			.returning();

		return NextResponse.json({
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
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
		}

		const body = await request.json();
		const { ruleId } = body;

		if (!ruleId) {
			return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
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

		await db.delete(rules).where(and(eq(rules.id, ruleId), eq(rules.gameId, id)));

		const remainingRules = await db
			.select()
			.from(rules)
			.where(eq(rules.gameId, id))
			.orderBy(rules.order);

		for (let i = 0; i < remainingRules.length; i++) {
			await db.update(rules).set({ order: i + 1 }).where(eq(rules.id, remainingRules[i].id));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting rule:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
