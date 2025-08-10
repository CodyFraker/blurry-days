import { dev } from '$app/environment';
import cron from 'node-cron';
import { sheetSyncService } from '$lib/googleSheets/sync';

// Set up cron job to sync questions from Google Sheets
// This runs every hour by default
if (!dev) {
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled Google Sheets sync...');
    try {
      const results = await sheetSyncService.syncQuestions();
      console.log(`Sync completed. Added: ${results.added}, Updated: ${results.updated}, Total: ${results.total}`);
    } catch (error) {
      console.error('Error in scheduled sync:', error);
    }
  });
}

// No hooks to export, just setting up the cron job
export const handle = async ({ event, resolve }) => {
  return await resolve(event);
};