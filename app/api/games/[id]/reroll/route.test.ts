import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const requireGameEdit = vi.fn();

vi.mock('@/lib/games/requireGameEdit', () => ({
	requireGameEdit: (...args: unknown[]) => requireGameEdit(...args)
}));

vi.mock('@/lib/security/rateLimit', () => ({
	getClientIp: () => '127.0.0.1',
	rateLimitOrResponse: () => null
}));

describe('POST /api/games/[id]/reroll', () => {
	beforeEach(() => {
		requireGameEdit.mockReset();
	});

	it('returns 403 when edit authorization fails', async () => {
		requireGameEdit.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await POST(new Request('http://localhost'), {
			params: Promise.resolve({ id: 'g1' })
		});

		expect(response.status).toBe(403);
	});
});
