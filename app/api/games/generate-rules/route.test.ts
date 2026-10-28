import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const { rateLimitOrResponse } = vi.hoisted(() => ({
	rateLimitOrResponse: vi.fn(() => null)
}));

vi.mock('@/lib/security/rateLimit', () => ({
	getClientIp: () => '127.0.0.1',
	rateLimitOrResponse
}));

vi.mock('@/lib/rules/ruleEngine', () => ({
	generateRulesForVideo: vi.fn(() => Promise.resolve([]))
}));

describe('POST /api/games/generate-rules', () => {
	beforeEach(() => {
		rateLimitOrResponse.mockReset();
		rateLimitOrResponse.mockReturnValue(null);
	});

	it('returns 400 when numberOfRules is out of range', async () => {
		const response = await POST(
			new Request('http://localhost/api/games/generate-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoId: 'v1',
					videoTitle: 'Title',
					numberOfRules: 100,
					intoxicationLevel: 2
				})
			})
		);

		expect(response.status).toBe(400);
	});

	it('returns 429 when rate limited', async () => {
		rateLimitOrResponse.mockReturnValue(
			new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
		);

		const response = await POST(
			new Request('http://localhost/api/games/generate-rules', {
				method: 'POST',
				body: JSON.stringify({})
			})
		);

		expect(response.status).toBe(429);
	});
});
