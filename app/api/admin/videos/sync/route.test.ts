import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/youtube/syncChannelVideos', () => ({
	syncChannelVideos: vi.fn().mockResolvedValue({
		videos: [],
		syncedAt: new Date(),
		fromCache: false
	})
}));

vi.mock('@/lib/admin/auditLog', () => ({
	recordAdminAction: vi.fn()
}));

describe('POST /api/admin/videos/sync', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when not admin', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await POST();

		expect(response.status).toBe(403);
	});
});
