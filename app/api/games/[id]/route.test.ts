import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/db', () => ({
	db: {
		select: () => ({
			from: () => ({
				where: () => ({
					limit: () => Promise.resolve([])
				})
			})
		})
	}
}));

vi.mock('@/lib/games/getPlayableGameRules', () => ({
	getPlayableGameRules: () => Promise.resolve([])
}));

describe('GET /api/games/[id]', () => {
	it('does not expose editToken in the response body', async () => {
		const response = await GET(new Request('http://localhost'), {
			params: Promise.resolve({ id: '00000000-0000-4000-8000-000000000001' })
		});

		const text = await response.text();
		expect(text).not.toContain('editToken');
	});
});
