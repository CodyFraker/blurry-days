import { describe, it, expect } from 'vitest';
import { validateCreateGameBody } from './validateCreateGame';

describe('validateCreateGameBody', () => {
	it('returns success for valid payload', () => {
		const result = validateCreateGameBody({
			videoId: 'abc',
			videoTitle: 'Test Video',
			intoxicationLevel: 2,
			rules: [{ text: 'Drink', category: 'general', baseDrink: 0 }]
		});
		expect(result.success).toBe(true);
	});

	it('returns error when required fields are missing', () => {
		const result = validateCreateGameBody({ videoId: 'abc' });
		expect(result.success).toBe(false);
	});
});
