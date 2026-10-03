import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { syncChannelVideos } from '@/lib/youtube/syncChannelVideos';

/**
 * POST /api/admin/videos/sync
 *
 * Force YouTube RSS sync (bypass cache).
 */
export async function POST() {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const result = await syncChannelVideos({ force: true, includeHidden: true });

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'video.sync',
		entityType: 'youtube_channel',
		entityId: 'grainydays',
		metadata: { fromCache: result.fromCache, count: result.videos.length }
	});

	return NextResponse.json({
		syncedAt: result.syncedAt.toISOString(),
		fromCache: result.fromCache,
		count: result.videos.length
	});
}
