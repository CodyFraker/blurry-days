import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { patchAdminGameSchema } from '@/lib/admin/games/schemas';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { games, rules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/games/:id
 *
 * - 401 / 403 — auth
 * - 404 — not found
 * - 200 — game and rules
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { id } = await context.params;
	const gameRows = await db.select().from(games).where(eq(games.id, id)).limit(1);
	if (gameRows.length === 0) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	const game = gameRows[0];
	const gameRules = await db.select().from(rules).where(eq(rules.gameId, id)).orderBy(rules.order);

	return NextResponse.json({
		game: {
			...game,
			createdAt: game.createdAt.toISOString(),
			expiresAt: game.expiresAt.toISOString()
		},
		rules: gameRules
	});
}

/**
 * PATCH /api/admin/games/:id
 *
 * Update isActive, expiresAt, expiresNever.
 */
export async function PATCH(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { id } = await context.params;
	const body = await request.json();
	const parsed = patchAdminGameSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	const updates: Record<string, unknown> = { ...parsed.data };
	if (parsed.data.expiresAt) {
		updates.expiresAt = new Date(parsed.data.expiresAt);
	}

	const [updated] = await db.update(games).set(updates).where(eq(games.id, id)).returning();
	if (!updated) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'game.update',
		entityType: 'game',
		entityId: id,
		metadata: parsed.data
	});

	return NextResponse.json({
		game: {
			...updated,
			createdAt: updated.createdAt.toISOString(),
			expiresAt: updated.expiresAt.toISOString()
		}
	});
}

/**
 * DELETE /api/admin/games/:id
 *
 * Hard delete game and rules (cascade).
 */
export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { id } = await context.params;
	const [deleted] = await db.delete(games).where(eq(games.id, id)).returning();
	if (!deleted) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'game.delete',
		entityType: 'game',
		entityId: id
	});

	return new NextResponse(null, { status: 204 });
}
