import { and, desc, eq, ilike, lt, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { isGamePlayable } from '@/lib/games/gameVisibility';
import type { z } from 'zod';
import type { listAdminGamesQuerySchema } from './schemas';

type ListQuery = z.infer<typeof listAdminGamesQuerySchema>;

export async function listAdminGames(query: ListQuery) {
	const now = new Date();
	const conditions = [];

	if (query.q) {
		const pattern = `%${query.q}%`;
		conditions.push(
			or(ilike(games.title, pattern), ilike(sql`cast(${games.id} as text)`, pattern))
		);
	}
	if (query.userId) {
		conditions.push(eq(games.userId, query.userId));
	}
	if (query.videoId) {
		conditions.push(eq(games.videoId, query.videoId));
	}
	if (query.active === 'true') {
		conditions.push(eq(games.isActive, true));
	}
	if (query.active === 'false') {
		conditions.push(eq(games.isActive, false));
	}
	if (query.expiresNever === 'true') {
		conditions.push(eq(games.expiresNever, true));
	}
	if (query.expiresNever === 'false') {
		conditions.push(eq(games.expiresNever, false));
	}
	if (query.expired === 'true') {
		conditions.push(and(eq(games.expiresNever, false), lt(games.expiresAt, now)));
	}
	if (query.expired === 'false') {
		conditions.push(or(eq(games.expiresNever, true), sql`${games.expiresAt} >= ${now}`));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
	const offset = (query.page - 1) * query.pageSize;

	const rows = await db
		.select()
		.from(games)
		.where(whereClause)
		.orderBy(desc(games.createdAt))
		.limit(query.pageSize)
		.offset(offset);

	const countResult = await db
		.select({ total: sql<number>`count(*)::int` })
		.from(games)
		.where(whereClause);

	const total = countResult[0]?.total ?? 0;

	return {
		games: rows.map((game) => ({
			...game,
			playable: isGamePlayable(game, now)
		})),
		pagination: {
			page: query.page,
			pageSize: query.pageSize,
			total,
			totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize)
		}
	};
}
