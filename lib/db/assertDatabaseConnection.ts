import postgres from 'postgres';

import { resolveDatabaseUrl } from './resolveDatabaseUrl';

export async function assertDatabaseConnection(): Promise<void> {
	const client = postgres(resolveDatabaseUrl(), { max: 1 });
	try {
		await client`SELECT 1`;
	} catch (error) {
		throw new Error('Database connection failed', { cause: error });
	} finally {
		await client.end({ timeout: 5 });
	}
}
