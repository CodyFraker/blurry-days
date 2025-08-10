import { json } from '@sveltejs/kit';
import { sheetSyncService } from '$lib/googleSheets/sync';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const results = await sheetSyncService.syncQuestions();
    
    return json({
      success: true,
      message: `Sync completed successfully. Added: ${results.added}, Updated: ${results.updated}, Total: ${results.total}`,
      results
    });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    return json({
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
};