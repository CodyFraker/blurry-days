import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateProductionEnv } from './validateProductionEnv';

describe('validateProductionEnv', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('throws when required variables are missing', () => {
		vi.stubEnv('AUTH_SECRET', '');
		vi.stubEnv('DATABASE_URL', '');
		vi.stubEnv('ADMIN_DISCORD_IDS', '');

		expect(() => validateProductionEnv()).toThrow(/AUTH_SECRET/);
	});

	it('passes when required variables are set', () => {
		vi.stubEnv('AUTH_SECRET', 'secret');
		vi.stubEnv('DATABASE_URL', 'postgres://localhost/db');
		vi.stubEnv('ADMIN_DISCORD_IDS', '123');

		expect(() => validateProductionEnv()).not.toThrow();
	});
});
