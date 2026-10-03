import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const listPlayableGamesForVideo = vi.fn();

vi.mock('@/lib/games/listPlayableGamesForVideo', () => ({
	listPlayableGamesForVideo: (...args: unknown[]) => listPlayableGamesForVideo(...args)
}));

describe('GET /api/videos/[id]/games', () => {
	beforeEach(() => {
		listPlayableGamesForVideo.mockReset();
	});

	it('returns 404 when video is missing or hidden', async () => {
		listPlayableGamesForVideo.mockResolvedValue(null);

		const response = await GET(new Request('http://localhost/api/videos/v1/games'), {
			params: Promise.resolve({ id: 'v1' })
		});

		expect(response.status).toBe(404);
	});

	it('returns video and games when found', async () => {
		listPlayableGamesForVideo.mockResolvedValue({
			video: { id: 'v1', title: 'Test', thumbnail: null },
			games: [{ id: 'g1', title: 'Game 1' }]
		});

		const response = await GET(new Request('http://localhost/api/videos/v1/games'), {
			params: Promise.resolve({ id: 'v1' })
		});

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.games).toHaveLength(1);
		expect(listPlayableGamesForVideo).toHaveBeenCalledWith('v1');
	});
});
