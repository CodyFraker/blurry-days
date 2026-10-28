export async function register() {
	if (process.env.NEXT_RUNTIME !== 'nodejs') {
		return;
	}

	if (process.env.NODE_ENV !== 'production') {
		return;
	}

	try {
		const startupModulePath = `${process.cwd()}/productionStartup.js`;
		const { runProductionDatabaseStartup } = await import(
			/* webpackIgnore: true */
			startupModulePath
		);
		await runProductionDatabaseStartup();
		const { scheduleVideoSyncIfConfigured } = await import('@/lib/youtube/scheduleVideoSync');
		scheduleVideoSyncIfConfigured();
	} catch (error) {
		console.error('[startup] database startup failed:', error);
		process.exit(1);
	}
}
