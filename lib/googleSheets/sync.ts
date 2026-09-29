import { db } from '@/lib/db';
import { questions, type NewQuestion, type Question } from '@/lib/db/schema';
import { getGoogleSheetsService, type SheetQuestion } from './index';
import { eq } from 'drizzle-orm';

export class SheetSyncService {
	async syncQuestions() {
		const sheetQuestions = await getGoogleSheetsService().fetchQuestions();
		const existingQuestions = await db.select().from(questions);

		const existingQuestionsMap = new Map(existingQuestions.map((q) => [q.sheetId, q]));

		const results = {
			added: 0,
			updated: 0,
			total: sheetQuestions.length
		};

		for (const sheetQuestion of sheetQuestions) {
			const existingQuestion = existingQuestionsMap.get(sheetQuestion.id);

			if (!existingQuestion) {
				await this.addQuestion(sheetQuestion);
				results.added++;
			} else if (this.hasChanged(sheetQuestion, existingQuestion)) {
				await this.updateQuestion(sheetQuestion, existingQuestion.id);
				results.updated++;
			}
		}

		return results;
	}

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

	private async updateQuestion(sheetQuestion: SheetQuestion, questionId: string) {
		await db
			.update(questions)
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

	private hasChanged(sheetQuestion: SheetQuestion, dbQuestion: Question): boolean {
		return (
			sheetQuestion.text !== dbQuestion.text ||
			sheetQuestion.category !== dbQuestion.category ||
			sheetQuestion.weight !== dbQuestion.weight ||
			sheetQuestion.baseDrink !== dbQuestion.baseDrink ||
			sheetQuestion.order !== dbQuestion.order
		);
	}
}

export const sheetSyncService = new SheetSyncService();
