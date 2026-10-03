export async function register() {
	// Scheduled jobs (e.g. legacy Sheets sync) belong in a separate worker or
	// external cron hitting API routes — importing googleapis here breaks Next dev.
}
