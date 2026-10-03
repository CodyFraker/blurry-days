import { NextResponse } from 'next/server';
import { runSystemChecks } from '@/lib/admin/system/checks';
import { requireAdmin } from '@/lib/auth/requireAdmin';

/**
 * GET /api/admin/system/checks
 *
 * Database, RSS, and env presence checks (no secrets).
 */
export async function GET() {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult.response;
	}

	const checks = await runSystemChecks();
	return NextResponse.json(checks);
}
