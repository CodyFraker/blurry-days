import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
	process.env.DATABASE_URL ||
	process.env.DATABASE_URL_TEST ||
	'postgres://grainydays:grainydays_dev@localhost:5432/grainydays';

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
