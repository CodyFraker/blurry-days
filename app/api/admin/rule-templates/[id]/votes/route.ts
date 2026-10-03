import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { ruleVotes } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * GET /api/admin/rule-templates/:id/votes
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
	const votes = await db
		.select()
		.from(ruleVotes)
		.where(eq(ruleVotes.ruleTemplateId, id))
		.orderBy(desc(ruleVotes.createdAt))
		.limit(200);

	return NextResponse.json({
		votes: votes.map((v) => ({
			userId: v.userId,
			vote: v.vote,
			createdAt: v.createdAt.toISOString()
		}))
	});
}

/**
 * DELETE /api/admin/rule-templates/:id/votes
 *
 * Clear all votes for a template.
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
	await db.delete(ruleVotes).where(eq(ruleVotes.ruleTemplateId, id));

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'rule_votes.clear_template',
		entityType: 'rule_template',
		entityId: id
	});

	return new NextResponse(null, { status: 204 });
}
