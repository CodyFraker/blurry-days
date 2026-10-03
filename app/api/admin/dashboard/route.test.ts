import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/system/dashboard', () => ({
	getAdminDashboard: vi.fn().mockResolvedValue({ users: 0 })
}));

describe('GET /api/admin/dashboard', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when forbidden', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await GET();

		expect(response.status).toBe(403);
	});
});
