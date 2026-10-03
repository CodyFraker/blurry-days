import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/auditLog', () => ({
	recordAdminAction: vi.fn()
}));

vi.mock('@/lib/db', () => ({
	db: {
		update: () => ({
			set: () => ({
				where: () => ({
					returning: () => Promise.resolve([])
				})
			})
		})
	}
}));

describe('PATCH /api/admin/games/:id', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 401 when unauthorized', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
		});

		const response = await PATCH(
			new Request('http://localhost', {
				method: 'PATCH',
				body: JSON.stringify({ isActive: false })
			}),
			{ params: Promise.resolve({ id: 'g1' }) }
		);

		expect(response.status).toBe(401);
	});
});
