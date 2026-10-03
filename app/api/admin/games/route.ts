import { NextResponse } from 'next/server';
import { listAdminGames } from '@/lib/admin/games/listAdminGames';
import { listAdminGamesQuerySchema } from '@/lib/admin/games/schemas';
import { requireAdmin } from '@/lib/auth/requireAdmin';

/**
 * GET /api/admin/games
 *
 * Search and list games. Query: page, pageSize, q, userId, videoId, active, expired, expiresNever.
 *
 * - 401 / 403 — auth
 * - 200 — `{ games, pagination }`
 */
export async function GET(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { searchParams } = new URL(request.url);
	const raw: Record<string, string> = {};
	searchParams.forEach((value, key) => {
		raw[key] = value;
	});

	const parsed = listAdminGamesQuerySchema.safeParse(raw);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
	}

	const result = await listAdminGames(parsed.data);

	return NextResponse.json({
		games: result.games.map((g) => ({
			id: g.id,
			title: g.title,
			videoId: g.videoId,
			videoTitle: g.videoTitle,
			userId: g.userId,
			isActive: g.isActive,
			expiresAt: g.expiresAt.toISOString(),
			expiresNever: g.expiresNever,
			createdAt: g.createdAt.toISOString(),
			playable: g.playable
		})),
		pagination: result.pagination
	});
}
