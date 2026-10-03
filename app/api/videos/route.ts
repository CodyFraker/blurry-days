import { NextResponse } from 'next/server';
import { syncChannelVideos } from '@/lib/youtube/syncChannelVideos';

export async function GET() {
	try {
		const { videos } = await syncChannelVideos({ force: false, includeHidden: false });
		return NextResponse.json(videos);
	} catch (error) {
		console.error('Error in /api/videos:', error);
		return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
	}
}
