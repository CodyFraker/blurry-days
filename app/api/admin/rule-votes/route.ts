import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { listRuleVoteLeaderboard } from '@/lib/admin/votes/listRuleVoteLeaderboard';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { ruleVotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/admin/rule-votes
 *
 * Leaderboard of rule templates by vote volume.
 */
export async function GET() {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const rows = await listRuleVoteLeaderboard();
	return NextResponse.json({ templates: rows });
}

const deleteUserVotesSchema = z.object({
	userId: z.string().min(1)
});

/**
 * DELETE /api/admin/rule-votes
 *
 * Body: `{ userId }` — remove all votes by user.
 */
export async function DELETE(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const body = await request.json();
	const parsed = deleteUserVotesSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	await db.delete(ruleVotes).where(eq(ruleVotes.userId, parsed.data.userId));

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'rule_votes.clear_user',
		entityType: 'user',
		entityId: parsed.data.userId
	});

	return new NextResponse(null, { status: 204 });
}
