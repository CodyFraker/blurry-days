import { NextResponse } from 'next/server';
import { getAdminDashboard } from '@/lib/admin/system/dashboard';
import { requireAdmin } from '@/lib/auth/requireAdmin';

/**
 * GET /api/admin/dashboard
 *
 * Summary counts and read-only config for admins.
 */
export async function GET() {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const dashboard = await getAdminDashboard();
	return NextResponse.json(dashboard);
}
