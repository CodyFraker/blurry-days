import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { createAdminVideoSchema } from '@/lib/admin/videos/schemas';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { youtubeVideos } from '@/lib/db/schema';
import { getLatestVideoSyncTime, syncChannelVideos } from '@/lib/youtube/syncChannelVideos';

/**
 * GET /api/admin/videos
 *
 * All videos including hidden, with game counts and last sync metadata.
 */
export async function GET() {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { videos } = await syncChannelVideos({ force: false, includeHidden: true });
	const lastSync = await getLatestVideoSyncTime();

	return NextResponse.json({
		videos: videos.map((v) => ({
			...v,
			publishedAt: v.publishedAt.toISOString(),
			lastFetched: v.lastFetched.toISOString()
		})),
		lastSync: lastSync?.toISOString() ?? null
	});
}

/**
 * POST /api/admin/videos
 *
 * Manually add a YouTube video row.
 */
export async function POST(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const body = await request.json();
	const parsed = createAdminVideoSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	const [created] = await db
		.insert(youtubeVideos)
		.values({
			id: parsed.data.id,
			title: parsed.data.title,
			publishedAt: new Date(parsed.data.publishedAt),
			thumbnail: parsed.data.thumbnail ?? null,
			description: parsed.data.description ?? null,
			lastFetched: new Date()
		})
		.onConflictDoUpdate({
			target: youtubeVideos.id,
			set: {
				title: parsed.data.title,
				publishedAt: new Date(parsed.data.publishedAt),
				thumbnail: parsed.data.thumbnail ?? null,
				description: parsed.data.description ?? null,
				lastFetched: new Date()
			}
		})
		.returning();

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'video.create',
		entityType: 'youtube_video',
		entityId: created.id
	});

	return NextResponse.json(
		{
			video: {
				...created,
				publishedAt: created.publishedAt.toISOString(),
				lastFetched: created.lastFetched.toISOString()
			}
		},
		{ status: 201 }
	);
}
