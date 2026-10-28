import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { getTestDb, truncateGameTables } from '../helpers/db';
import { games, ruleTemplates } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { hashEditToken } from '@/lib/games/editToken';
import { POST as rerollPost } from '@/app/api/games/[id]/reroll/route';
import { v4 as uuidv4 } from 'uuid';

const hasTestDb = !!process.env.DATABASE_URL_TEST || process.env.RUN_INTEGRATION_TESTS === '1';

describe.skipIf(!hasTestDb)('game edit token', () => {
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

	it('allows reroll with valid edit token and rejects without token', async () => {
		const gameId = uuidv4();
		const token = 'integration-edit-token';
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		await db.insert(games).values({
			id: gameId,
			title: 'Test',
			videoId: 'vid',
			videoTitle: 'Video',
			intoxicationLevel: 2,
			expiresAt,
			editTokenHash: hashEditToken(token),
			isActive: true,
			expiresNever: false
		});

		await db.insert(ruleTemplates).values({
			text: 'Take a sip when {host} speaks',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			enabled: true
		});

		const forbidden = await rerollPost(new Request('http://localhost'), {
			params: Promise.resolve({ id: gameId })
		});
		expect(forbidden.status).toBe(403);

		const allowed = await rerollPost(
			new Request('http://localhost', {
				headers: { 'X-Game-Edit-Token': token }
			}),
			{ params: Promise.resolve({ id: gameId }) }
		);
		expect(allowed.status).toBe(200);
	});
});
