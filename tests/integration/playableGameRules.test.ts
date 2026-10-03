import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql, eq } from 'drizzle-orm';
import { getTestDb, truncateGameTables } from '../helpers/db';
import { getPlayableGameRules } from '@/lib/games/getPlayableGameRules';
import { games, rules, ruleTemplates } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('playable game rules', () => {
	const db = getTestDb();

	beforeAll(async () => {
		try {
			await db.execute(sql`SELECT 1`);
		} catch {
			throw new Error('Test database is not available. Set DATABASE_URL_TEST or RUN_INTEGRATION_TESTS=1');
		}
	});

	afterEach(async () => {
		await truncateGameTables(db);
	});

	it('returns live template description for catalog rules', async () => {
		const gameId = uuidv4();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		const [template] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Template text',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip,
				description: 'Original guidance'
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
			text: 'Snapshot text',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			isCustom: false,
			order: 1
		});

		await db
			.update(ruleTemplates)
			.set({ description: 'Updated guidance' })
			.where(eq(ruleTemplates.id, template.id));

		const loaded = await getPlayableGameRules(gameId);

		expect(loaded).toHaveLength(1);
		expect(loaded[0].description).toBe('Updated guidance');
	});

	it('returns null description for custom rules', async () => {
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
			text: 'Custom rule',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			isCustom: true,
			order: 1
		});

		const loaded = await getPlayableGameRules(gameId);

		expect(loaded[0].description).toBeNull();
	});
});
