import { assertDatabaseConnection } from './assertDatabaseConnection';
import { applyMigrations } from './applyMigrations';
import { ensureDatabase } from './ensureDatabase';
import { validateProductionEnv } from '@/lib/startup/validateProductionEnv';
import { scheduleVideoSyncIfConfigured } from '@/lib/youtube/scheduleVideoSync';

export async function runProductionDatabaseStartup(): Promise<void> {
	validateProductionEnv();
	await ensureDatabase();
	await applyMigrations();
	await assertDatabaseConnection();
	scheduleVideoSyncIfConfigured();
}
