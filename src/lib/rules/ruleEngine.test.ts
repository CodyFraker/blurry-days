import { describe, it, expect } from 'vitest';
import { selectRules, calculateEffectiveDrink, getDrinkName } from './ruleEngine';
import { DrinkEnum } from '$lib/db/schema';

describe('Rule Engine', () => {
	describe('selectRules', () => {
		it('should return the correct number of rules', () => {
			const rules = selectRules(3, 5);
			expect(rules).toHaveLength(5);
		});

		it('should return rules with different categories', () => {
			const rules = selectRules(2, 5);
			const categories = rules.map(rule => rule.category);
			const uniqueCategories = new Set(categories);
			
			// Should have at least 2 different categories
			expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
		});

		it('should handle different intoxication levels', () => {
			const rules1 = selectRules(1, 3);
			const rules2 = selectRules(5, 3);
			
			expect(rules1).toHaveLength(3);
			expect(rules2).toHaveLength(3);
		});
	});

	describe('calculateEffectiveDrink', () => {
		it('should add intoxication level to base drink', () => {
			const result = calculateEffectiveDrink(DrinkEnum.Sip, 2);
			expect(result).toBe(DrinkEnum.Gulp);
		});

		it('should cap at maximum drink level', () => {
			const result = calculateEffectiveDrink(DrinkEnum.Pull, 3);
			expect(result).toBe(DrinkEnum.Shot);
		});

		it('should handle zero intoxication level', () => {
			const result = calculateEffectiveDrink(DrinkEnum.Gulp, 0);
			expect(result).toBe(DrinkEnum.Gulp);
		});
	});

	describe('getDrinkName', () => {
		it('should return correct drink names', () => {
			expect(getDrinkName(DrinkEnum.Sip)).toBe('Sip');
			expect(getDrinkName(DrinkEnum.Gulp)).toBe('Gulp');
			expect(getDrinkName(DrinkEnum.Pull)).toBe('Pull');
			expect(getDrinkName(DrinkEnum.Shot)).toBe('Shot');
		});

		it('should return default for unknown drink level', () => {
			expect(getDrinkName(999)).toBe('Sip');
		});
	});
}); 