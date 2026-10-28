import { describe, expect, it } from 'vitest';
import { generateEditToken, hashEditToken, verifyEditToken } from './editToken';

describe('editToken', () => {
	it('stores a hash that differs from the raw token', () => {
		const { token, hash } = generateEditToken();

		expect(token.length).toBeGreaterThan(20);
		expect(hash).not.toBe(token);
		expect(hash).toBe(hashEditToken(token));
	});

	it('verifies a matching token', () => {
		const { token, hash } = generateEditToken();

		expect(verifyEditToken(hash, token)).toBe(true);
	});

	it('rejects a wrong token', () => {
		const { hash } = generateEditToken();

		expect(verifyEditToken(hash, 'wrong-token')).toBe(false);
		expect(verifyEditToken(null, 'token')).toBe(false);
	});
});
