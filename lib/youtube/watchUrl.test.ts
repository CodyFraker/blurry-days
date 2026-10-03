import { describe, it, expect } from 'vitest';
import { getYoutubeWatchUrl } from '@/lib/youtube/watchUrl';

describe('getYoutubeWatchUrl', () => {
	it('builds a YouTube watch URL for a video id', () => {
		expect(getYoutubeWatchUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123');
	});
});
