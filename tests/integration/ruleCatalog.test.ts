import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { getTestDb, truncateCatalogTables } from '../helpers/db';
import { listRuleTemplates } from '@/lib/rules/ruleCatalog';
import { ruleTemplates, ruleVotes, users } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('rule catalog', () => {
	const db = getTestDb();

	beforeAll(async () => {
		try {
			await db.execute(sql`SELECT 1`);
		} catch {
			throw new Error('Test database is not available. Set DATABASE_URL_TEST or RUN_INTEGRATION_TESTS=1');
		}
	});

	afterEach(async () => {
		await truncateCatalogTables(db);
	});

	it('paginates templates with default page size 25', async () => {
		const rows = Array.from({ length: 30 }, (_, i) => ({
			text: `Rule template ${i}`,
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip
		}));
		await db.insert(ruleTemplates).values(rows);

		const page1 = await listRuleTemplates({
			page: 1,
			pageSize: 25,
			offset: 0,
			limit: 25
		});

		expect(page1.rules).toHaveLength(25);
		expect(page1.pagination.total).toBe(30);
		expect(page1.pagination.totalPages).toBe(2);

		const page2 = await listRuleTemplates({
			page: 2,
			pageSize: 25,
			offset: 25,
			limit: 25
		});

		expect(page2.rules).toHaveLength(5);
	});

	it('aggregates thumbs up and thumbs down from rule_votes', async () => {
		const [template] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Voted rule',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip
			})
			.returning();

		const voterA = crypto.randomUUID();
		const voterB = crypto.randomUUID();
		const voterC = crypto.randomUUID();
		await db.insert(users).values([
			{ id: voterA, email: `${voterA}@test.com` },
			{ id: voterB, email: `${voterB}@test.com` },
			{ id: voterC, email: `${voterC}@test.com` }
		]);

		await db.insert(ruleVotes).values([
			{ userId: voterA, ruleTemplateId: template.id, vote: 1 },
			{ userId: voterB, ruleTemplateId: template.id, vote: 1 },
			{ userId: voterC, ruleTemplateId: template.id, vote: -1 }
		]);

		const result = await listRuleTemplates({
			page: 1,
			pageSize: 25,
			offset: 0,
			limit: 25
		});

		const row = result.rules.find((r) => r.id === template.id);
		expect(row?.thumbsUp).toBe(2);
		expect(row?.thumbsDown).toBe(1);
	});

	it('omits disabled templates from public catalog', async () => {
		const [enabled] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Enabled rule',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip,
				enabled: true
			})
			.returning();
		await db.insert(ruleTemplates).values({
			text: 'Disabled rule',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			enabled: false
		});

		const result = await listRuleTemplates({
			page: 1,
			pageSize: 25,
			offset: 0,
			limit: 25
		});

		expect(result.rules.some((r) => r.id === enabled.id)).toBe(true);
		expect(result.rules.some((r) => r.text === 'Disabled rule')).toBe(false);
	});
});
