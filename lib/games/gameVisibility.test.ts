import { describe, expect, it } from 'vitest';
import { isGamePlayable } from './gameVisibility';

describe('isGamePlayable', () => {
	const past = new Date('2020-01-01');
	const future = new Date('2099-01-01');
	const now = new Date('2025-06-01');

	it('returns false when inactive', () => {
		expect(
			isGamePlayable(
				{ isActive: false, expiresNever: false, expiresAt: future },
				now
			)
		).toBe(false);
	});

	it('returns false when expired and not expiresNever', () => {
		expect(
			isGamePlayable(
				{ isActive: true, expiresNever: false, expiresAt: past },
				now
			)
		).toBe(false);
	});

	it('returns true when active and not expired', () => {
		expect(
			isGamePlayable(
				{ isActive: true, expiresNever: false, expiresAt: future },
				now
			)
		).toBe(true);
	});

	it('returns true when expiresNever even if expiresAt is past', () => {
		expect(
			isGamePlayable(
				{ isActive: true, expiresNever: true, expiresAt: past },
				now
			)
		).toBe(true);
	});
});
