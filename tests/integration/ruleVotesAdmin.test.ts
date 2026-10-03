import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql, eq } from 'drizzle-orm';
import { getTestDb, truncateCatalogTables } from '../helpers/db';
import { listRuleTemplates } from '@/lib/rules/ruleCatalog';
import { ruleTemplates, ruleVotes, users } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('rule vote clearing', () => {
	const db = getTestDb();

	beforeAll(async () => {
		try {
			await db.execute(sql`SELECT 1`);
		} catch {
			throw new Error('Test database is not available.');
		}
	});

	afterEach(async () => {
		await truncateCatalogTables(db);
	});

	it('cleared votes no longer appear in catalog aggregates', async () => {
		const [template] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Voted rule',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip
			})
			.returning();

		const voterId = crypto.randomUUID();
		await db.insert(users).values({ id: voterId, email: `${voterId}@test.com` });
		await db.insert(ruleVotes).values({
			userId: voterId,
			ruleTemplateId: template.id,
			vote: 1
		});

		await db.delete(ruleVotes).where(eq(ruleVotes.ruleTemplateId, template.id));

		const result = await listRuleTemplates({
			page: 1,
			pageSize: 25,
			offset: 0,
			limit: 25
		});
		const row = result.rules.find((r) => r.id === template.id);
		expect(row?.thumbsUp).toBe(0);
	});
});
