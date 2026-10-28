import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';
import { getYoutubeThumbnailUrl } from '@/lib/youtube/thumbnailUrl';

const { rateLimitOrResponse } = vi.hoisted(() => ({
	rateLimitOrResponse: vi.fn(() => null)
}));

const insertValues = vi.hoisted(() => vi.fn());

vi.mock('@/lib/security/rateLimit', () => ({
	getClientIp: () => '127.0.0.1',
	rateLimitOrResponse
}));

vi.mock('@/lib/auth/config', () => ({
	auth: vi.fn(() => Promise.resolve(null))
}));

vi.mock('@/lib/rules/assertTemplatesUsable', () => ({
	assertRuleTemplatesUsable: vi.fn(() => Promise.resolve({ ok: true }))
}));

vi.mock('@/lib/rules/incrementTemplateUsage', () => ({
	incrementRuleTemplateUsage: vi.fn(() => Promise.resolve())
}));

const insertCallCount = vi.hoisted(() => ({ value: 0 }));

vi.mock('@/lib/db', () => ({
	db: {
		insert: () => ({
			values: (...args: unknown[]) => {
				insertCallCount.value += 1;
				insertValues(...args);
				if (insertCallCount.value === 1) {
					return {
						returning: () =>
							Promise.resolve([
								{
									title: 'Game',
									expiresAt: new Date('2030-01-01')
								}
							])
					};
				}
				return Promise.resolve();
			}
		}),
		select: () => ({
			from: () => ({
				where: () => ({
					orderBy: () => Promise.resolve([])
				})
			})
		})
	}
}));

describe('POST /api/games', () => {
	beforeEach(() => {
		rateLimitOrResponse.mockReset();
		rateLimitOrResponse.mockReturnValue(null);
		insertValues.mockReset();
		insertCallCount.value = 0;
	});

	it('returns 400 for invalid body', async () => {
		const response = await POST(
			new Request('http://localhost/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ videoId: 'v1' })
			})
		);

		expect(response.status).toBe(400);
	});

	it('returns 429 when rate limited', async () => {
		rateLimitOrResponse.mockReturnValue(
			new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
		);

		const response = await POST(
			new Request('http://localhost/api/games', {
				method: 'POST',
				body: JSON.stringify({})
			})
		);

		expect(response.status).toBe(429);
	});

	it('stores server-derived thumbnail from videoId', async () => {
		const response = await POST(
			new Request('http://localhost/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoId: 'abc123',
					videoTitle: 'Title',
					videoThumbnail: 'https://evil.example/x.png',
					intoxicationLevel: 2,
					rules: [{ text: 'Drink', category: CategoryEnum.General, baseDrink: DrinkEnum.Sip }]
				})
			})
		);

		expect(response.status).toBe(200);
		expect(insertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				videoThumbnail: getYoutubeThumbnailUrl('abc123')
			})
		);
		const body = await response.json();
		expect(body.editToken).toBeDefined();
	});
});
