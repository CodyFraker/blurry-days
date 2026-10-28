import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/db', () => ({
	checkDatabaseConnection: vi.fn(() => Promise.resolve(true))
}));

describe('GET /api/health', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('returns minimal public payload', async () => {
		const response = await GET(new Request('http://localhost/api/health'));
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ status: 'ok' });
	});

	it('returns database status when authorized', async () => {
		vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');

		const response = await GET(
			new Request('http://localhost/api/health', {
				headers: { Authorization: 'Bearer test-secret' }
			})
		);
		const body = await response.json();

		expect(body).toEqual({ status: 'ok', database: 'connected' });
	});
});
