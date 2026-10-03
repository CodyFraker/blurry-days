import { afterEach, describe, expect, it, vi } from 'vitest';
import { getVideoSyncCacheMinutes, shouldRefreshFromCache } from './syncChannelVideos';

describe('shouldRefreshFromCache', () => {
	it('returns false when lastFetched is missing', () => {
		const now = new Date('2025-01-01T12:00:00Z');
		expect(shouldRefreshFromCache(null, now, 60)).toBe(false);
	});

	it('returns true when within cache window', () => {
		const now = new Date('2025-01-01T12:00:00Z');
		const lastFetched = new Date('2025-01-01T11:30:00Z');
		expect(shouldRefreshFromCache(lastFetched, now, 60)).toBe(true);
	});

	it('returns false when cache expired', () => {
		const now = new Date('2025-01-01T12:00:00Z');
		const lastFetched = new Date('2025-01-01T10:00:00Z');
		expect(shouldRefreshFromCache(lastFetched, now, 60)).toBe(false);
	});
});

describe('getVideoSyncCacheMinutes', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('defaults to 60', () => {
		vi.stubEnv('VIDEO_SYNC_CACHE_MINUTES', '');
		expect(getVideoSyncCacheMinutes()).toBe(60);
	});

	it('reads env when valid', () => {
		vi.stubEnv('VIDEO_SYNC_CACHE_MINUTES', '30');
		expect(getVideoSyncCacheMinutes()).toBe(30);
	});
});
