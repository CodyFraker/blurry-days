import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rules } from '@/lib/db/schema';
import { addCustomRuleBodySchema, deleteGameRuleBodySchema } from '@/lib/games/schemas';
import { requireGameEdit } from '@/lib/games/requireGameEdit';
import { calculateEffectiveDrink } from '@/lib/rules/ruleEngine';
import { getClientIp, rateLimitOrResponse } from '@/lib/security/rateLimit';

const MUTATE_GAME_WINDOW_MS = 60_000;
const MUTATE_GAME_LIMIT = 30;

function mutateRateLimit(request: Request, gameId: string) {
	return rateLimitOrResponse(request, {
		key: `games:mutate:${getClientIp(request)}:${gameId}`,
		limit: MUTATE_GAME_LIMIT,
		windowMs: MUTATE_GAME_WINDOW_MS
	});
}

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
		}

		const limited = mutateRateLimit(request, id);
		if (limited) {
			return limited;
		}

		const body = await request.json();
		const parsed = addCustomRuleBodySchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}
		const { text, category, baseDrink } = parsed.data;

		const editResult = await requireGameEdit(request, id);
		if ('response' in editResult) {
			return editResult.response;
		}

		const game = editResult.game;

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

		const limited = mutateRateLimit(request, id);
		if (limited) {
			return limited;
		}

		const body = await request.json();
		const parsed = deleteGameRuleBodySchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}
		const { ruleId } = parsed.data;

		const editResult = await requireGameEdit(request, id);
		if ('response' in editResult) {
			return editResult.response;
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
