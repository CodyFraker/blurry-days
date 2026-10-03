import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

import { resolveDatabaseUrl } from './resolveDatabaseUrl';

export { resolveDatabaseUrl };

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
