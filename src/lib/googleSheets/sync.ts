import { db } from '$lib/db';
import { questions, type NewQuestion } from '$lib/db/schema';
import { googleSheetsService, type SheetQuestion } from './index';
import { eq } from 'drizzle-orm';

export class SheetSyncService {
  /**
   * Sync questions from Google Sheets to the database
   * @returns Object containing counts of added, updated, and total questions
   */
  async syncQuestions() {
    try {
      // Fetch questions from Google Sheets
      const sheetQuestions = await googleSheetsService.fetchQuestions();
      
      // Fetch existing questions from the database
      const existingQuestions = await db.select().from(questions);
      
      // Create maps for easier lookup
      const existingQuestionsMap = new Map(
        existingQuestions.map(q => [q.sheetId, q])
      );
      
      const results = {
        added: 0,
        updated: 0,
        total: sheetQuestions.length
      };
      
      // Process each question from the sheet
      for (const sheetQuestion of sheetQuestions) {
        const existingQuestion = existingQuestionsMap.get(sheetQuestion.id);
        
        if (!existingQuestion) {
          // New question - insert it
          await this.addQuestion(sheetQuestion);
          results.added++;
        } else if (this.hasChanged(sheetQuestion, existingQuestion)) {
          // Question exists but has changed - update it
          await this.updateQuestion(sheetQuestion, existingQuestion.id);
          results.updated++;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error syncing questions:', error);
      throw error;
    }
  }
  
  /**
   * Add a new question to the database
   */
  private async addQuestion(sheetQuestion: SheetQuestion) {
    const newQuestion: NewQuestion = {
      sheetId: sheetQuestion.id,
      text: sheetQuestion.text,
      category: sheetQuestion.category,
      weight: sheetQuestion.weight,
      baseDrink: sheetQuestion.baseDrink,
      order: sheetQuestion.order,
      lastSynced: new Date()
    };
    
    await db.insert(questions).values(newQuestion);
  }
  
  /**
   * Update an existing question in the database
   */
  private async updateQuestion(sheetQuestion: SheetQuestion, questionId: string) {
    await db.update(questions)
      .set({
        text: sheetQuestion.text,
        category: sheetQuestion.category,
        weight: sheetQuestion.weight,
        baseDrink: sheetQuestion.baseDrink,
        order: sheetQuestion.order,
        lastSynced: new Date(),
        updatedAt: new Date()
      })
      .where(eq(questions.id, questionId));
  }
  
  /**
   * Check if a question has changed compared to its database version
   */
  private hasChanged(sheetQuestion: SheetQuestion, dbQuestion: any): boolean {
    return sheetQuestion.text !== dbQuestion.text ||
           sheetQuestion.category !== dbQuestion.category ||
           sheetQuestion.weight !== dbQuestion.weight ||
           sheetQuestion.baseDrink !== dbQuestion.baseDrink ||
           sheetQuestion.order !== dbQuestion.order;
  }
}

// Export a singleton instance
export const sheetSyncService = new SheetSyncService();