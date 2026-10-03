import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/games/listAdminGames', () => ({
	listAdminGames: vi.fn().mockResolvedValue({
		games: [],
		pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 }
	})
}));

describe('GET /api/admin/games', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when forbidden', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await GET(new Request('http://localhost/api/admin/games'));

		expect(response.status).toBe(403);
	});
});
