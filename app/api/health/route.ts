import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
	const ok = await checkDatabaseConnection();
	if (!ok) {
		return NextResponse.json({ status: 'error', database: 'disconnected' }, { status: 503 });
	}
	return NextResponse.json({ status: 'ok', database: 'connected' });
}
