import { assertDatabaseConnection } from './assertDatabaseConnection';
import { applyMigrations } from './applyMigrations';
import { ensureDatabase } from './ensureDatabase';
import { validateProductionEnv } from '@/lib/startup/validateProductionEnv';

export async function runProductionDatabaseStartup(): Promise<void> {
	validateProductionEnv();
	await ensureDatabase();
	await applyMigrations();
	await assertDatabaseConnection();
}
