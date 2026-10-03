import { applyMigrations } from './applyMigrations';
import { ensureDatabase } from './ensureDatabase';

export async function runMigrations(): Promise<void> {
	await ensureDatabase();
	await applyMigrations();
}
