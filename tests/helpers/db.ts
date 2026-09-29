import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@/lib/db/schema';

export function getTestDb() {
	const url =
		process.env.DATABASE_URL_TEST ||
		'postgres://grainydays:grainydays_dev@localhost:5432/grainydays_test';
	const client = postgres(url);
	return drizzle(client, { schema });
}

export async function truncateGameTables(db: ReturnType<typeof getTestDb>) {
	await db.execute(sql`TRUNCATE TABLE rules, games RESTART IDENTITY CASCADE`);
}
