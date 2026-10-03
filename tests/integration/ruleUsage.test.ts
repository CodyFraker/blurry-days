import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql, eq } from 'drizzle-orm';
import { getTestDb, truncateCatalogTables } from '../helpers/db';
import { games, rules, ruleTemplates } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { incrementRuleTemplateUsage } from '@/lib/rules/incrementTemplateUsage';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('rule template usage', () => {
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

	it('increments usage_count when a template is assigned', async () => {
		const [template] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Used rule',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip
			})
			.returning();

		await incrementRuleTemplateUsage([template.id, template.id]);

		const [updated] = await db
			.select()
			.from(ruleTemplates)
			.where(eq(ruleTemplates.id, template.id));

		expect(updated.usageCount).toBe(2);
	});

	it('persists rule_template_id on game rules', async () => {
		const gameId = uuidv4();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		const [template] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Linked rule',
				category: CategoryEnum.Camera,
				weight: 0.5,
				baseDrink: DrinkEnum.Gulp
			})
			.returning();

		await db.insert(games).values({
			id: gameId,
			title: 'Test Game',
			videoId: 'vid-1',
			videoTitle: 'Video',
			videoThumbnail: null,
			intoxicationLevel: 2,
			expiresAt
		});

		await db.insert(rules).values({
			gameId,
			ruleTemplateId: template.id,
			text: 'Take a sip when camera appears',
			category: CategoryEnum.Camera,
			weight: 0.5,
			baseDrink: DrinkEnum.Gulp,
			isCustom: false,
			order: 1
		});

		const loaded = await db.select().from(rules).where(eq(rules.gameId, gameId));
		expect(loaded[0].ruleTemplateId).toBe(template.id);
	});

	it('does not set rule_template_id for custom rules', async () => {
		const gameId = uuidv4();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		await db.insert(games).values({
			id: gameId,
			title: 'Test Game',
			videoId: 'vid-1',
			videoTitle: 'Video',
			videoThumbnail: null,
			intoxicationLevel: 2,
			expiresAt
		});

		await db.insert(rules).values({
			gameId,
			ruleTemplateId: null,
			text: 'Custom chug',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Shot,
			isCustom: true,
			order: 1
		});

		const loaded = await db.select().from(rules).where(eq(rules.gameId, gameId));
		expect(loaded[0].ruleTemplateId).toBeNull();
		expect(loaded[0].isCustom).toBe(true);
	});
});
