import { describe, it, expect } from 'vitest';
import { calculateEffectiveDrink, getDrinkName } from './drinks';
import { selectRulesFromPool, type RuleTemplatePoolItem } from './ruleEngine';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';

const testPool: RuleTemplatePoolItem[] = [
	{
		id: '1',
		text: 'Camera rule A',
		category: CategoryEnum.Camera,
		weight: 0.8,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '2',
		text: 'Camera rule B',
		category: CategoryEnum.Camera,
		weight: 0.6,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '3',
		text: 'Film rule A',
		category: CategoryEnum.Film,
		weight: 0.9,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '4',
		text: 'Film rule B',
		category: CategoryEnum.Film,
		weight: 0.5,
		baseDrink: DrinkEnum.Gulp
	},
	{
		id: '5',
		text: 'Technique rule',
		category: CategoryEnum.Technique,
		weight: 0.7,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '6',
		text: 'Location rule',
		category: CategoryEnum.Location,
		weight: 0.8,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '7',
		text: 'Equipment rule',
		category: CategoryEnum.Equipment,
		weight: 0.7,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '8',
		text: 'General rule',
		category: CategoryEnum.General,
		weight: 0.9,
		baseDrink: DrinkEnum.Sip
	},
	{
		id: '9',
		text: 'General rule B',
		category: CategoryEnum.General,
		weight: 0.8,
		baseDrink: DrinkEnum.Gulp
	},
	{
		id: '10',
		text: 'Camera rule C',
		category: CategoryEnum.Camera,
		weight: 0.5,
		baseDrink: DrinkEnum.Sip
	}
];

describe('Rule Engine', () => {
	describe('selectRulesFromPool', () => {
		it('returns at most maxRules and at least one rule', () => {
			const rules = selectRulesFromPool(testPool, 3, 5);
			expect(rules.length).toBeGreaterThan(0);
			expect(rules.length).toBeLessThanOrEqual(5);
		});

		it('should return rules with different categories', () => {
			const rules = selectRulesFromPool(testPool, 2, 5);
			const categories = rules.map((rule) => rule.category);
			const uniqueCategories = new Set(categories);
			expect(uniqueCategories.size).toBeGreaterThan(1);
		});

		it('should work with different intoxication levels', () => {
			const rules1 = selectRulesFromPool(testPool, 1, 3);
			const rules2 = selectRulesFromPool(testPool, 5, 3);
			expect(rules1.length).toBeGreaterThan(0);
			expect(rules1.length).toBeLessThanOrEqual(3);
			expect(rules2.length).toBeGreaterThan(0);
			expect(rules2.length).toBeLessThanOrEqual(3);
		});
	});

	describe('calculateEffectiveDrink', () => {
		it('should cap at Shot level', () => {
			expect(calculateEffectiveDrink(DrinkEnum.Sip, 5)).toBe(DrinkEnum.Shot);
		});
	});

	describe('getDrinkName', () => {
		it('should return sip for level 0', () => {
			expect(getDrinkName(DrinkEnum.Sip).name).toBe('Sip');
		});
	});
});
