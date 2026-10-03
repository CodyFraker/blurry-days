export async function register() {
	if (process.env.NEXT_RUNTIME !== 'nodejs') {
		return;
	}

	try {
		const { ensureDatabase } = await import('./lib/db/ensureDatabase');
		await ensureDatabase();
	} catch (error) {
		console.error('[startup] ensuring database failed:', error);
		process.exit(1);
	}

	try {
		const { applyMigrations } = await import('./lib/db/applyMigrations');
		await applyMigrations();
	} catch (error) {
		console.error('[startup] applying migrations failed:', error);
		process.exit(1);
	}

	try {
		const { assertDatabaseConnection } = await import('./lib/db/assertDatabaseConnection');
		await assertDatabaseConnection();
	} catch (error) {
		console.error('[startup] database connection failed:', error);
		process.exit(1);
	}

	// Scheduled jobs (e.g. legacy Sheets sync) belong in a separate worker or
	// external cron hitting API routes — importing googleapis here breaks Next dev.
}
