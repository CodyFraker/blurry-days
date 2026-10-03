import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/votes/listRuleVoteLeaderboard', () => ({
	listRuleVoteLeaderboard: vi.fn().mockResolvedValue([])
}));

vi.mock('@/lib/admin/auditLog', () => ({
	recordAdminAction: vi.fn()
}));

vi.mock('@/lib/db', () => ({
	db: {
		delete: () => ({
			where: () => Promise.resolve()
		})
	}
}));

describe('DELETE /api/admin/rule-votes', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when forbidden', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await DELETE(
			new Request('http://localhost', {
				method: 'DELETE',
				body: JSON.stringify({ userId: 'u1' })
			})
		);

		expect(response.status).toBe(403);
	});
});
