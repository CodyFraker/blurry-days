import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ADMIN_MUTATION_HEADER,
	ADMIN_MUTATION_HEADER_VALUE,
	requireAdminMutation
} from './requireAdminMutation';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

describe('requireAdminMutation', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 for mutating requests without the admin header', async () => {
		requireAdmin.mockResolvedValue({ user: { id: 'u1' }, discordAccountId: 'd1' });

		const result = await requireAdminMutation(
			new Request('http://localhost', { method: 'POST' })
		);

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(403);
	});

	it('allows mutating requests with the admin header', async () => {
		requireAdmin.mockResolvedValue({ user: { id: 'u1' }, discordAccountId: 'd1' });

		const result = await requireAdminMutation(
			new Request('http://localhost', {
				method: 'POST',
				headers: { [ADMIN_MUTATION_HEADER]: ADMIN_MUTATION_HEADER_VALUE }
			})
		);

		expect('user' in result).toBe(true);
	});
});
