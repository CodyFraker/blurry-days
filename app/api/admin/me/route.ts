import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

/**
 * GET /api/admin/me
 *
 * Returns whether the current session belongs to an admin (Discord ID listed in ADMIN_DISCORD_IDS).
 *
 * - 401 — not signed in
 * - 403 — signed in but not an admin
 * - 200 — `{ isAdmin: true, discordAccountId: string }`
 */
export async function GET() {
	const result = await requireAdmin();
	if ('response' in result) {
		return result.response;
	}

	return NextResponse.json({
		isAdmin: true,
		discordAccountId: result.discordAccountId
	});
}
