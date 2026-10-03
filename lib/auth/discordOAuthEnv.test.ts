import { afterEach, describe, expect, it, vi } from 'vitest';
import { readDiscordOAuthEnv } from './discordOAuthEnv';

describe('readDiscordOAuthEnv', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('reads DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET', () => {
		vi.stubEnv('DISCORD_CLIENT_ID', ' 1555953793190072490 ');
		vi.stubEnv('DISCORD_CLIENT_SECRET', ' secret-value ');

		expect(readDiscordOAuthEnv()).toEqual({
			clientId: '1555953793190072490',
			clientSecret: 'secret-value'
		});
	});

	it('falls back to AUTH_DISCORD_ID and AUTH_DISCORD_SECRET', () => {
		vi.stubEnv('AUTH_DISCORD_ID', '999888777666555444');
		vi.stubEnv('AUTH_DISCORD_SECRET', 'auth-secret');

		expect(readDiscordOAuthEnv()).toEqual({
			clientId: '999888777666555444',
			clientSecret: 'auth-secret'
		});
	});

	it('throws when client id is missing', () => {
		vi.stubEnv('DISCORD_CLIENT_SECRET', 'secret');

		expect(() => readDiscordOAuthEnv()).toThrow(/DISCORD_CLIENT_ID/);
	});

	it('throws when client id is not numeric', () => {
		vi.stubEnv('DISCORD_CLIENT_ID', 'not-a-snowflake');
		vi.stubEnv('DISCORD_CLIENT_SECRET', 'secret');

		expect(() => readDiscordOAuthEnv()).toThrow(/DISCORD_CLIENT_ID/);
	});
});
