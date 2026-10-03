import { describe, expect, it, vi, beforeEach } from 'vitest';
import { assertRuleTemplatesUsable } from './assertTemplatesUsable';

const selectMock = vi.fn();

vi.mock('@/lib/db', () => ({
	db: {
		select: () => ({
			from: () => ({
				where: () => selectMock()
			})
		})
	}
}));

describe('assertRuleTemplatesUsable', () => {
	beforeEach(() => {
		selectMock.mockReset();
	});

	it('returns ok for empty id list', async () => {
		const result = await assertRuleTemplatesUsable([]);
		expect(result).toEqual({ ok: true });
	});

	it('returns error when template missing', async () => {
		selectMock.mockResolvedValue([{ id: 'a', enabled: true }]);
		const result = await assertRuleTemplatesUsable(['a', 'b']);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('not found');
		}
	});

	it('returns error when template disabled', async () => {
		selectMock.mockResolvedValue([{ id: 'a', enabled: false }]);
		const result = await assertRuleTemplatesUsable(['a']);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain('disabled');
		}
	});
});
