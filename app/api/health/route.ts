import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

function isDetailedHealthAuthorized(request: Request): boolean {
	const secret = process.env.HEALTH_CHECK_SECRET?.trim();
	if (!secret) {
		return false;
	}
	const auth = request.headers.get('authorization');
	return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
	if (!isDetailedHealthAuthorized(request)) {
		return NextResponse.json({ status: 'ok' });
	}

	const ok = await checkDatabaseConnection();
	if (!ok) {
		return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 503 });
	}
	return NextResponse.json({ status: 'ok', database: 'connected' });
}
