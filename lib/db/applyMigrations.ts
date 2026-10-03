import path from 'node:path';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { resolveDatabaseUrl } from './resolveDatabaseUrl';

export async function applyMigrations(): Promise<void> {
	const connectionString = resolveDatabaseUrl();
	const client = postgres(connectionString, { max: 1 });
	const db = drizzle(client);

	try {
		await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
	} finally {
		await client.end({ timeout: 5 });
	}
}
