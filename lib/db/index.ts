import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export function resolveDatabaseUrl(): string {
	const defaultUrl = 'postgres://grainydays:grainydays_dev@localhost:5432/grainydays';
	if (process.env.RUN_INTEGRATION_TESTS === '1' && process.env.DATABASE_URL_TEST) {
		return process.env.DATABASE_URL_TEST;
	}
	return process.env.DATABASE_URL || process.env.DATABASE_URL_TEST || defaultUrl;
}

const connectionString = resolveDatabaseUrl();

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export { schema };

export async function checkDatabaseConnection(): Promise<boolean> {
	try {
		await client`SELECT 1`;
		return true;
	} catch {
		return false;
	}
}
