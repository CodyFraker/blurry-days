export async function register() {
	if (process.env.NODE_ENV !== 'production') {
		return;
	}

	const cron = await import('node-cron');
	const { sheetSyncService } = await import('@/lib/googleSheets/sync');

	cron.default.schedule('0 * * * *', async () => {
		console.log('Running scheduled Google Sheets sync...');
		try {
			const results = await sheetSyncService.syncQuestions();
			console.log(
				`Sync completed. Added: ${results.added}, Updated: ${results.updated}, Total: ${results.total}`
			);
		} catch (error) {
			console.error('Error in scheduled sync:', error);
		}
	});
}
