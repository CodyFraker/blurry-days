import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireAdmin } from './requireAdmin';

const auth = vi.fn();
const getDiscordAccountIdForUser = vi.fn();

vi.mock('@/lib/auth/config', () => ({
	auth: () => auth()
}));

vi.mock('@/lib/auth/getDiscordAccountId', () => ({
	getDiscordAccountIdForUser: (userId: string) => getDiscordAccountIdForUser(userId)
}));

describe('requireAdmin', () => {
	beforeEach(() => {
		auth.mockReset();
		getDiscordAccountIdForUser.mockReset();
		vi.stubEnv('ADMIN_DISCORD_IDS', '999888777');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('returns 401 when there is no session', async () => {
		auth.mockResolvedValue(null);

		const result = await requireAdmin();

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(401);
	});

	it('returns 403 when discord account is missing', async () => {
		auth.mockResolvedValue({ user: { id: 'user-1', name: 'Test' } });
		getDiscordAccountIdForUser.mockResolvedValue(null);

		const result = await requireAdmin();

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(403);
	});

	it('returns 403 when discord id is not in admin list', async () => {
		auth.mockResolvedValue({ user: { id: 'user-1', name: 'Test' } });
		getDiscordAccountIdForUser.mockResolvedValue('111222333');

		const result = await requireAdmin();

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(403);
	});

	it('returns user and discord account id for admins', async () => {
		auth.mockResolvedValue({
			user: { id: 'user-1', name: 'Admin', email: 'a@test.com', image: null }
		});
		getDiscordAccountIdForUser.mockResolvedValue('999888777');

		const result = await requireAdmin();

		expect('user' in result).toBe(true);
		if (!('user' in result)) {
			return;
		}
		expect(result.user.id).toBe('user-1');
		expect(result.discordAccountId).toBe('999888777');
	});
});
