import { describe, it, expect } from 'vitest';
import {
	getYoutubeThumbnailUrl,
	getYoutubeThumbnailFallbackUrls,
	YOUTUBE_THUMBNAIL_HOST
} from './thumbnailUrl';

describe('getYoutubeThumbnailUrl', () => {
	it('returns mqdefault URL by default', () => {
		const url = getYoutubeThumbnailUrl('abc123');

		expect(url).toBe(`${YOUTUBE_THUMBNAIL_HOST}/vi/abc123/mqdefault.jpg`);
	});

	it('returns URL for requested variant', () => {
		const url = getYoutubeThumbnailUrl('abc123', 'maxresdefault');

		expect(url).toBe(`${YOUTUBE_THUMBNAIL_HOST}/vi/abc123/maxresdefault.jpg`);
	});
});

describe('getYoutubeThumbnailFallbackUrls', () => {
	it('returns unique mqdefault, maxresdefault, and stored URL', () => {
		const urls = getYoutubeThumbnailFallbackUrls('vid1', 'https://example.com/old.jpg');

		expect(urls).toEqual([
			`${YOUTUBE_THUMBNAIL_HOST}/vi/vid1/mqdefault.jpg`,
			`${YOUTUBE_THUMBNAIL_HOST}/vi/vid1/maxresdefault.jpg`,
			'https://example.com/old.jpg'
		]);
	});
});
