import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAdminDiscordIds, isAdminDiscordId } from './adminDiscordIds';

describe('adminDiscordIds', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('returns empty list when env is unset', () => {
		vi.stubEnv('ADMIN_DISCORD_IDS', '');

		expect(getAdminDiscordIds()).toEqual([]);
		expect(isAdminDiscordId('123')).toBe(false);
	});

	it('parses single and multiple ids with trim and dedupe', () => {
		vi.stubEnv('ADMIN_DISCORD_IDS', ' 111 ,222,111 , 333 ');

		expect(getAdminDiscordIds()).toEqual(['111', '222', '333']);
		expect(isAdminDiscordId('222')).toBe(true);
		expect(isAdminDiscordId('999')).toBe(false);
	});

	it('ignores non-numeric segments', () => {
		vi.stubEnv('ADMIN_DISCORD_IDS', '123,not-an-id,456');

		expect(getAdminDiscordIds()).toEqual(['123', '456']);
	});
});
