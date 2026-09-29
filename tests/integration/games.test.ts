import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { getTestDb, truncateGameTables } from '../helpers/db';
import { games, rules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('games persistence', () => {
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

	it('inserts a game and rules with foreign key', async () => {
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
			text: 'Take a sip',
			category: 'general',
			weight: 1,
			baseDrink: 0,
			isCustom: false,
			order: 1
		});

		const loaded = await db.select().from(rules).where(eq(rules.gameId, gameId));
		expect(loaded).toHaveLength(1);
		expect(loaded[0].text).toBe('Take a sip');
	});
});
