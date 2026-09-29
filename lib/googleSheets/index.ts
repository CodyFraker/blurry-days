import { google, sheets_v4 } from 'googleapis';
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import type { CategoryEnum } from '@/lib/db/schema';

export interface SheetQuestion {
	id: string;
	text: string;
	category: keyof typeof CategoryEnum;
	weight: number;
	baseDrink: number;
	order: number;
}

export class GoogleSheetsService {
	private sheets: sheets_v4.Sheets;
	private auth: JSONClient;
	private sheetId: string;

	constructor() {
		const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
		const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
		const sheetId = process.env.GOOGLE_SHEET_ID;

		if (!clientEmail || !privateKey || !sheetId) {
			throw new Error('Google Sheets environment variables are not configured');
		}

		this.auth = new google.auth.JWT({
			email: clientEmail,
			key: privateKey.replace(/\\n/g, '\n'),
			scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
		});

		this.sheets = google.sheets({ version: 'v4', auth: this.auth });
		this.sheetId = sheetId;
	}

	async fetchQuestions(): Promise<SheetQuestion[]> {
		const response = await this.sheets.spreadsheets.values.get({
			spreadsheetId: this.sheetId,
			range: 'Questions!A2:F'
		});

		const rows = response.data.values;

		if (!rows || rows.length === 0) {
			return [];
		}

		return rows
			.map((row, index) => ({
				id: row[0] || `row-${index + 2}`,
				text: row[1] || '',
				category: (row[2] || 'general') as keyof typeof CategoryEnum,
				weight: parseFloat(row[3]) || 1.0,
				baseDrink: parseInt(row[4]) || 0,
				order: parseInt(row[5]) || index
			}))
			.filter((q) => q.text);
	}
}

let instance: GoogleSheetsService | null = null;

export function getGoogleSheetsService(): GoogleSheetsService {
	if (!instance) {
		instance = new GoogleSheetsService();
	}
	return instance;
}
