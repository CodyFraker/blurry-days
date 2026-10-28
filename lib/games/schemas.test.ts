import { describe, expect, it } from 'vitest';
import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';
import {
	createGameBodySchema,
	generateRulesBodySchema,
	MAX_GAME_RULES,
	MAX_RULE_TEXT_LENGTH
} from './schemas';

describe('createGameBodySchema', () => {
	it('accepts a valid payload', () => {
		const result = createGameBodySchema.safeParse({
			videoId: 'abc',
			videoTitle: 'Test Video',
			intoxicationLevel: 2,
			rules: [{ text: 'Drink', category: CategoryEnum.General, baseDrink: DrinkEnum.Sip }]
		});

		expect(result.success).toBe(true);
	});

	it('rejects more than max rules', () => {
		const rules = Array.from({ length: MAX_GAME_RULES + 1 }, () => ({
			text: 'x',
			category: CategoryEnum.General,
			baseDrink: DrinkEnum.Sip
		}));
		const result = createGameBodySchema.safeParse({
			videoId: 'abc',
			videoTitle: 'Test Video',
			intoxicationLevel: 2,
			rules
		});

		expect(result.success).toBe(false);
	});

	it('rejects oversized rule text', () => {
		const result = createGameBodySchema.safeParse({
			videoId: 'abc',
			videoTitle: 'Test Video',
			intoxicationLevel: 2,
			rules: [
				{
					text: 'x'.repeat(MAX_RULE_TEXT_LENGTH + 1),
					category: CategoryEnum.General,
					baseDrink: DrinkEnum.Sip
				}
			]
		});

		expect(result.success).toBe(false);
	});

	it('rejects invalid category', () => {
		const result = createGameBodySchema.safeParse({
			videoId: 'abc',
			videoTitle: 'Test Video',
			intoxicationLevel: 2,
			rules: [{ text: 'Drink', category: 'not-a-category', baseDrink: DrinkEnum.Sip }]
		});

		expect(result.success).toBe(false);
	});
});

describe('generateRulesBodySchema', () => {
	it('rejects numberOfRules of zero', () => {
		const result = generateRulesBodySchema.safeParse({
			videoId: 'v1',
			videoTitle: 'Title',
			numberOfRules: 0,
			intoxicationLevel: 2
		});

		expect(result.success).toBe(false);
	});

	it('rejects numberOfRules above max', () => {
		const result = generateRulesBodySchema.safeParse({
			videoId: 'v1',
			videoTitle: 'Title',
			numberOfRules: 37,
			intoxicationLevel: 2
		});

		expect(result.success).toBe(false);
	});
});
