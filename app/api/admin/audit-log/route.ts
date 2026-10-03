import { NextResponse } from 'next/server';
import { listAuditLog } from '@/lib/admin/system/dashboard';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { z } from 'zod';

const querySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

/**
 * GET /api/admin/audit-log
 *
 * Paginated admin audit log.
 */
export async function GET(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { searchParams } = new URL(request.url);
	const parsed = querySchema.safeParse({
		page: searchParams.get('page') ?? undefined,
		pageSize: searchParams.get('pageSize') ?? undefined
	});
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
	}

	const result = await listAuditLog(parsed.data.page, parsed.data.pageSize);

	return NextResponse.json({
		entries: result.entries.map((e) => ({
			id: e.id,
			adminUserId: e.adminUserId,
			action: e.action,
			entityType: e.entityType,
			entityId: e.entityId,
			metadata: e.metadata,
			createdAt: e.createdAt.toISOString()
		})),
		pagination: result.pagination
	});
}
