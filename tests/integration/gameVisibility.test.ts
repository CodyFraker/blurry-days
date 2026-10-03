import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { getTestDb, truncateGameTables } from '../helpers/db';
import { games } from '@/lib/db/schema';
import { isGamePlayable, playableGameFilter } from '@/lib/games/gameVisibility';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('game visibility', () => {
	const db = getTestDb();

	beforeAll(async () => {
		try {
			await db.execute(sql`SELECT 1`);
		} catch {
			throw new Error('Test database is not available.');
		}
	});

	afterEach(async () => {
		await truncateGameTables(db);
	});

	it('loads expiresNever game via playable filter when expiresAt is past', async () => {
		const id = uuidv4();
		const past = new Date('2020-01-01');
		await db.insert(games).values({
			id,
			title: 'Pinned',
			videoId: 'v',
			videoTitle: 'V',
			intoxicationLevel: 1,
			expiresAt: past,
			expiresNever: true,
			isActive: true
		});

		const rows = await db
			.select()
			.from(games)
			.where(and(eq(games.id, id), playableGameFilter(new Date('2025-01-01'))));

		expect(rows).toHaveLength(1);
		expect(isGamePlayable(rows[0], new Date('2025-01-01'))).toBe(true);
	});
});
