import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { resolveDatabaseUrl } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export function getTestDb() {
	const client = postgres(resolveDatabaseUrl());
	return drizzle(client, { schema });
}

export async function truncateGameTables(db: ReturnType<typeof getTestDb>) {
	await db.execute(
		sql`TRUNCATE TABLE rule_votes, rules, games, rule_templates RESTART IDENTITY CASCADE`
	);
}

export async function truncateCatalogTables(db: ReturnType<typeof getTestDb>) {
	await db.execute(
		sql`TRUNCATE TABLE rule_votes, rules, games, rule_templates RESTART IDENTITY CASCADE`
	);
}
