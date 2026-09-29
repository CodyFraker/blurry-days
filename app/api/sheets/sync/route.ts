import { NextResponse } from 'next/server';
import { sheetSyncService } from '@/lib/googleSheets/sync';

export async function GET() {
	try {
		const results = await sheetSyncService.syncQuestions();

		return NextResponse.json({
			success: true,
			message: `Sync completed successfully. Added: ${results.added}, Updated: ${results.updated}, Total: ${results.total}`,
			results
		});
	} catch (error) {
		console.error('Error in sync endpoint:', error);
		return NextResponse.json(
			{
				success: false,
				message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			},
			{ status: 500 }
		);
	}
}
