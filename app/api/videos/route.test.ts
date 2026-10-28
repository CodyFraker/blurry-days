import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const listPublicVideos = vi.fn();
const syncChannelVideos = vi.fn();

vi.mock('@/lib/youtube/syncChannelVideos', () => ({
	listPublicVideos: (...args: unknown[]) => listPublicVideos(...args),
	syncChannelVideos: (...args: unknown[]) => syncChannelVideos(...args)
}));

describe('GET /api/videos', () => {
	beforeEach(() => {
		listPublicVideos.mockReset();
		syncChannelVideos.mockReset();
		listPublicVideos.mockResolvedValue([{ id: 'v1', title: 'Video' }]);
	});

	it('returns videos from the database without syncing RSS', async () => {
		const response = await GET();

		expect(response.status).toBe(200);
		expect(listPublicVideos).toHaveBeenCalledTimes(1);
		expect(syncChannelVideos).not.toHaveBeenCalled();
		const body = await response.json();
		expect(body).toEqual([{ id: 'v1', title: 'Video' }]);
	});
});
