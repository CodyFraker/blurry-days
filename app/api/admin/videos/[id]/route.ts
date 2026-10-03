import { NextResponse } from 'next/server';
import { recordAdminAction } from '@/lib/admin/auditLog';
import { patchAdminVideoSchema } from '@/lib/admin/videos/schemas';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { db } from '@/lib/db';
import { games, youtubeVideos } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * PATCH /api/admin/videos/:id
 */
export async function PATCH(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { id } = await context.params;
	const body = await request.json();
	const parsed = patchAdminVideoSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
	}

	const [updated] = await db
		.update(youtubeVideos)
		.set(parsed.data)
		.where(eq(youtubeVideos.id, id))
		.returning();

	if (!updated) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'video.update',
		entityType: 'youtube_video',
		entityId: id,
		metadata: parsed.data
	});

	return NextResponse.json({
		video: {
			...updated,
			publishedAt: updated.publishedAt.toISOString(),
			lastFetched: updated.lastFetched.toISOString()
		}
	});
}

/**
 * DELETE /api/admin/videos/:id
 *
 * 409 if games reference this video.
 */
export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const { id } = await context.params;
	const countResult = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(games)
		.where(eq(games.videoId, id));
	const gameCount = countResult[0]?.count ?? 0;
	if (gameCount > 0) {
		return NextResponse.json({ error: 'Video has associated games' }, { status: 409 });
	}

	const [deleted] = await db.delete(youtubeVideos).where(eq(youtubeVideos.id, id)).returning();
	if (!deleted) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}

	await recordAdminAction({
		adminUserId: adminResult.user.id,
		action: 'video.delete',
		entityType: 'youtube_video',
		entityId: id
	});

	return new NextResponse(null, { status: 204 });
}
