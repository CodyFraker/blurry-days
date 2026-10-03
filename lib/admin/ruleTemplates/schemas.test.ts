import { describe, it, expect } from 'vitest';
import { createRuleTemplateSchema, updateRuleTemplateSchema } from './schemas';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';

describe('createRuleTemplateSchema', () => {
	it('accepts optional description', () => {
		const result = createRuleTemplateSchema.safeParse({
			text: 'Rule text',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			description: 'When in doubt, sip.'
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('When in doubt, sip.');
		}
	});

	it('treats empty description as omitted', () => {
		const result = createRuleTemplateSchema.safeParse({
			text: 'Rule text',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			description: ''
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
		}
	});

	it('rejects description over max length', () => {
		const result = createRuleTemplateSchema.safeParse({
			text: 'Rule text',
			category: CategoryEnum.General,
			weight: 1,
			baseDrink: DrinkEnum.Sip,
			description: 'x'.repeat(2001)
		});

		expect(result.success).toBe(false);
	});
});

describe('updateRuleTemplateSchema', () => {
	it('accepts null to clear description', () => {
		const result = updateRuleTemplateSchema.safeParse({ description: null });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeNull();
		}
	});
});
