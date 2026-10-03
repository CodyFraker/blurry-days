import { describe, it, expect } from 'vitest';
import {
	parseVideoDescriptionExtras,
	formatVideoMetaSegments
} from './videoDescriptionExtras';

describe('parseVideoDescriptionExtras', () => {
	it('returns empty object for null description', () => {
		const result = parseVideoDescriptionExtras(null);

		expect(result).toEqual({});
	});

	it('returns empty object when appended stats are absent', () => {
		const result = parseVideoDescriptionExtras('Plain video description only.');

		expect(result).toEqual({});
	});

	it('parses duration, views, and likes from RSS-enhanced description', () => {
		const description =
			'About this video.\n\nDuration: PT15M30S\nViews: 45,000\nLikes: 1,200';

		const result = parseVideoDescriptionExtras(description);

		expect(result).toEqual({
			duration: 'PT15M30S',
			views: '45,000',
			likes: '1,200'
		});
	});
});

describe('formatVideoMetaSegments', () => {
	it('joins date, game count, duration, and views', () => {
		const publishedAt = new Date('2024-03-12T12:00:00Z');
		const segments = formatVideoMetaSegments(publishedAt, 3, {
			duration: '12:34',
			views: '45,000'
		});

		expect(segments).toContain('3 games');
		expect(segments).toContain('12:34');
		expect(segments).toContain('45,000 views');
		expect(segments.some((s) => s.includes('2024') || s.includes('3/12'))).toBe(true);
	});
});
