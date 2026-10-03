import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { updateRuleTemplateSchema } from '@/lib/admin/ruleTemplates/schemas';
import { getAdminRuleTemplateById } from '@/lib/admin/ruleTemplates/ruleTemplateAdmin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { ruleTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/rule-templates/:id
 *
 * - 401 / 403 — auth
 * - 404 — not found
 * - 200 — rule with vote aggregates
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
	const rule = await getAdminRuleTemplateById(id);
	if (!rule) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	return NextResponse.json({
		rule: {
			...rule,
			createdAt: rule.createdAt.toISOString()
		}
	});
}

/**
 * PATCH /api/admin/rule-templates/:id
 *
 * - 401 / 403 — auth
 * - 400 — validation
 * - 404 — not found
 * - 200 — updated rule
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
	const parsed = updateRuleTemplateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	const [updated] = await db
		.update(ruleTemplates)
		.set(parsed.data)
		.where(eq(ruleTemplates.id, id))
		.returning();

	if (!updated) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'rule_template.update',
		entityType: 'rule_template',
		entityId: id,
		metadata: parsed.data
	});

	return NextResponse.json({
		rule: {
			...updated,
			createdAt: updated.createdAt.toISOString()
		}
	});
}

/**
 * DELETE /api/admin/rule-templates/:id
 *
 * - 401 / 403 — auth
 * - 404 — not found
 * - 204 — deleted
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
	const [deleted] = await db.delete(ruleTemplates).where(eq(ruleTemplates.id, id)).returning();

	if (!deleted) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'rule_template.delete',
		entityType: 'rule_template',
		entityId: id
	});

	return new NextResponse(null, { status: 204 });
}
