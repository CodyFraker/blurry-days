import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, resetRateLimitStoreForTests } from './rateLimit';

describe('checkRateLimit', () => {
	beforeEach(() => {
		resetRateLimitStoreForTests();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('allows requests under the limit', () => {
		const now = Date.now();

		const first = checkRateLimit({ key: 'k1', limit: 2, windowMs: 60_000, nowMs: now });
		const second = checkRateLimit({ key: 'k1', limit: 2, windowMs: 60_000, nowMs: now + 1 });

		expect(first.allowed).toBe(true);
		expect(second.allowed).toBe(true);
	});

	it('blocks when limit is exceeded', () => {
		const now = Date.now();
		checkRateLimit({ key: 'k2', limit: 1, windowMs: 60_000, nowMs: now });
		const blocked = checkRateLimit({ key: 'k2', limit: 1, windowMs: 60_000, nowMs: now + 1 });

		expect(blocked.allowed).toBe(false);
		if (blocked.allowed) {
			return;
		}
		expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
	});

	it('resets after the window elapses', () => {
		const now = Date.now();
		checkRateLimit({ key: 'k3', limit: 1, windowMs: 60_000, nowMs: now });
		const blocked = checkRateLimit({ key: 'k3', limit: 1, windowMs: 60_000, nowMs: now + 1000 });
		expect(blocked.allowed).toBe(false);

		const afterWindow = checkRateLimit({
			key: 'k3',
			limit: 1,
			windowMs: 60_000,
			nowMs: now + 60_001
		});
		expect(afterWindow.allowed).toBe(true);
	});
});
