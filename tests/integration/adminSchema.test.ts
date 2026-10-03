import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { getTestDb, truncateCatalogTables } from '../helpers/db';
import { games, ruleTemplates, youtubeVideos } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('admin schema defaults', () => {
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

	it('defaults enabled on rule templates', async () => {
		const [row] = await db
			.insert(ruleTemplates)
			.values({
				text: 'Test rule',
				category: CategoryEnum.General,
				weight: 1,
				baseDrink: DrinkEnum.Sip
			})
			.returning();

		expect(row.enabled).toBe(true);
	});

	it('defaults expiresNever false on games', async () => {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 1);
		const [row] = await db
			.insert(games)
			.values({
				id: uuidv4(),
				title: 'Test',
				videoId: 'v1',
				videoTitle: 'Video',
				intoxicationLevel: 1,
				expiresAt
			})
			.returning();

		expect(row.expiresNever).toBe(false);
	});

	it('defaults isHidden false on youtube videos', async () => {
		const [row] = await db
			.insert(youtubeVideos)
			.values({
				id: 'yt-test-1',
				title: 'Title',
				publishedAt: new Date()
			})
			.returning();

		expect(row.isHidden).toBe(false);
	});
});
