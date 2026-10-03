import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPlayableGame } from './getPlayableGame';

const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock('@/lib/db', () => ({
	db: {
		select: (...args: unknown[]) => mockSelect(...args)
	}
}));

describe('getPlayableGame', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns game when found', async () => {
		mockLimit.mockResolvedValue([
			{
				id: 'g1',
				title: 'Test Game',
				videoTitle: 'Video',
				videoThumbnail: 'https://example.com/t.jpg'
			}
		]);

		const result = await getPlayableGame('g1');

		expect(result).toEqual({
			id: 'g1',
			title: 'Test Game',
			videoTitle: 'Video',
			videoThumbnail: 'https://example.com/t.jpg'
		});
	});

	it('returns null when not found', async () => {
		mockLimit.mockResolvedValue([]);

		const result = await getPlayableGame('missing');

		expect(result).toBeNull();
	});
});
