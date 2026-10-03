import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql, eq } from 'drizzle-orm';
import { getTestDb } from '../helpers/db';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { adminAuditLog, users } from '@/lib/db/schema';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('admin audit log', () => {
	const db = getTestDb();

	beforeAll(async () => {
		try {
			await db.execute(sql`SELECT 1`);
		} catch {
			throw new Error('Test database is not available.');
		}
	});

	afterEach(async () => {
		await db.execute(sql`TRUNCATE TABLE admin_audit_log RESTART IDENTITY CASCADE`);
		await db.delete(users);
	});

	it('records an admin action', async () => {
		const adminId = crypto.randomUUID();
		await db.insert(users).values({ id: adminId, email: `${adminId}@test.com` });

		await recordAdminAction({
			adminUserId: adminId,
			action: 'test.action',
			entityType: 'test',
			entityId: 'entity-1',
			metadata: { foo: 'bar' }
		});

		const rows = await db.select().from(adminAuditLog).where(eq(adminAuditLog.adminUserId, adminId));
		expect(rows).toHaveLength(1);
		expect(rows[0].action).toBe('test.action');
	});
});
