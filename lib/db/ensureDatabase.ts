import postgres from 'postgres';

import { resolveDatabaseUrl } from './resolveDatabaseUrl';

const SAFE_DATABASE_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function parseDatabaseName(connectionString: string): string {
	const url = new URL(connectionString);
	const rawName = decodeURIComponent(url.pathname.replace(/^\//, '').split('/')[0] ?? '');
	if (!rawName || !SAFE_DATABASE_NAME.test(rawName)) {
		throw new Error('Invalid or missing database name in DATABASE_URL');
	}
	return rawName;
}

function maintenanceConnectionString(connectionString: string): string {
	const url = new URL(connectionString);
	url.pathname = '/postgres';
	return url.toString();
}

export async function ensureDatabase(connectionString?: string): Promise<void> {
	const targetUrl = connectionString ?? resolveDatabaseUrl();
	const databaseName = parseDatabaseName(targetUrl);
	const admin = postgres(maintenanceConnectionString(targetUrl), { max: 1 });

	try {
		const existing = await admin<{ exists: number }[]>`
			SELECT 1 AS exists FROM pg_database WHERE datname = ${databaseName}
		`;
		if (existing.length === 0) {
			await admin.unsafe(`CREATE DATABASE ${databaseName}`);
		}
	} finally {
		await admin.end({ timeout: 5 });
	}
}
