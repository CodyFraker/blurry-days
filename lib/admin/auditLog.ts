import { db } from '@/lib/db';
import { adminAuditLog } from '@/lib/db/schema';

export async function recordAdminAction(input: {
	adminUserId: string;
	action: string;
	entityType: string;
	entityId: string;
	metadata?: Record<string, unknown>;
}) {
	await db.insert(adminAuditLog).values({
		adminUserId: input.adminUserId,
		action: input.action,
		entityType: input.entityType,
		entityId: input.entityId,
		metadata: input.metadata ?? null
	});
}
