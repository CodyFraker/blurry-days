import { describe, expect, it, vi, beforeEach } from 'vitest';
import { adminFetch } from './adminFetch';
import { ADMIN_MUTATION_HEADER, ADMIN_MUTATION_HEADER_VALUE } from './adminMutationHeaders';

describe('adminFetch', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('{}', { status: 200 }))));
	});

	it('adds the admin mutation header for POST requests', async () => {
		await adminFetch('/api/admin/rule-templates', { method: 'POST', body: '{}' });

		expect(fetch).toHaveBeenCalledWith(
			'/api/admin/rule-templates',
			expect.objectContaining({
				method: 'POST',
				headers: expect.any(Headers)
			})
		);

		const call = vi.mocked(fetch).mock.calls[0];
		const headers = call[1]?.headers as Headers;
		expect(headers.get(ADMIN_MUTATION_HEADER)).toBe(ADMIN_MUTATION_HEADER_VALUE);
	});
});
