import { NextResponse } from 'next/server';
import { listPlayableGamesForVideo } from '@/lib/games/listPlayableGamesForVideo';

/**
 * GET /api/videos/[id]/games
 * Lists active, non-expired games created for a public YouTube video.
 */
export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;

		if (!id) {
			return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
		}

		const result = await listPlayableGamesForVideo(id);

		if (!result) {
			return NextResponse.json({ error: 'Video not found' }, { status: 404 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in GET /api/videos/[id]/games:', error);
		return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
	}
}
