import { describe, it, expect } from 'vitest';
import { parseListRulesQuery } from './ruleCatalog';

describe('parseListRulesQuery', () => {
	it('uses default page 1 and page size 25', () => {
		const result = parseListRulesQuery(new URLSearchParams());

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.page).toBe(1);
		expect(result.data.pageSize).toBe(25);
		expect(result.data.offset).toBe(0);
		expect(result.data.limit).toBe(25);
	});

	it('computes offset from page and page size', () => {
		const result = parseListRulesQuery(new URLSearchParams('page=3&pageSize=10'));

		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.page).toBe(3);
		expect(result.data.pageSize).toBe(10);
		expect(result.data.offset).toBe(20);
		expect(result.data.limit).toBe(10);
	});

	it('rejects invalid page values', () => {
		const result = parseListRulesQuery(new URLSearchParams('page=0'));

		expect(result.success).toBe(false);
	});

	it('caps page size at 100', () => {
		const result = parseListRulesQuery(new URLSearchParams('pageSize=500'));

		expect(result.success).toBe(false);
	});
});
