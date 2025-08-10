import { google, sheets_v4 } from 'googleapis';
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
import { GOOGLE_SHEETS_API_KEY, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID } from '$env/static/private';
import type { CategoryEnum } from '$lib/db/schema';

// Define the structure of a question from the Google Sheet
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
    // Initialize the Google Sheets API client
    this.auth = new google.auth.JWT({
      email: GOOGLE_SHEETS_CLIENT_EMAIL,
      key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.sheetId = GOOGLE_SHEET_ID;
  }

  /**
   * Fetch questions from the Google Sheet
   * @returns Array of questions from the sheet
   */
  async fetchQuestions(): Promise<SheetQuestion[]> {
    try {
      // Assuming questions are in the first sheet, with headers in row 1
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Questions!A2:F', // Adjust range as needed for your sheet structure
      });

      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('No data found in the Google Sheet');
        return [];
      }

      // Map the rows to SheetQuestion objects
      return rows.map((row, index) => {
        // Assuming columns: ID, Text, Category, Weight, BaseDrink, Order
        return {
          id: row[0] || `row-${index + 2}`, // Use provided ID or generate one based on row number
          text: row[1] || '',
          category: (row[2] || 'general') as keyof typeof CategoryEnum,
          weight: parseFloat(row[3]) || 1.0,
          baseDrink: parseInt(row[4]) || 0,
          order: parseInt(row[5]) || index
        };
      }).filter(q => q.text); // Filter out any rows without text
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();