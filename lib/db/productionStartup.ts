import { assertDatabaseConnection } from './assertDatabaseConnection';
import { applyMigrations } from './applyMigrations';
import { ensureDatabase } from './ensureDatabase';

export async function runProductionDatabaseStartup(): Promise<void> {
	await ensureDatabase();
	await applyMigrations();
	await assertDatabaseConnection();
}
