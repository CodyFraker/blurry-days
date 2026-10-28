import { z } from 'zod';
import { CategoryEnum, DrinkEnum } from '@/lib/db/enums';

export const MAX_GAME_RULES = 36;
export const MAX_RULE_TEXT_LENGTH = 500;
export const MAX_GAME_TITLE_LENGTH = 200;
export const MIN_NUMBER_OF_RULES = 1;
export const MAX_NUMBER_OF_RULES = 36;

const categoryValues = Object.values(CategoryEnum) as [string, ...string[]];
const drinkValues = Object.values(DrinkEnum) as [number, ...number[]];

export const gameRuleSchema = z.object({
	text: z.string().min(1).max(MAX_RULE_TEXT_LENGTH),
	category: z.enum(categoryValues),
	baseDrink: z.number().refine((v) => drinkValues.includes(v as number)),
	isCustom: z.boolean().optional(),
	weight: z.number().optional(),
	ruleTemplateId: z.string().uuid().optional()
});

export const createGameBodySchema = z.object({
	title: z.string().max(MAX_GAME_TITLE_LENGTH).optional(),
	videoId: z.string().min(1),
	videoTitle: z.string().min(1),
	videoThumbnail: z.string().nullable().optional(),
	intoxicationLevel: z.number().int().min(1).max(5),
	rules: z.array(gameRuleSchema).min(1).max(MAX_GAME_RULES)
});

export type CreateGameBody = z.infer<typeof createGameBodySchema>;

export const generateRulesBodySchema = z.object({
	videoId: z.string().min(1),
	videoTitle: z.string().min(1),
	numberOfRules: z.number().int().min(MIN_NUMBER_OF_RULES).max(MAX_NUMBER_OF_RULES),
	intoxicationLevel: z.number().int().min(1).max(5)
});

export type GenerateRulesBody = z.infer<typeof generateRulesBodySchema>;

export const addCustomRuleBodySchema = z.object({
	text: z.string().min(1).max(MAX_RULE_TEXT_LENGTH),
	category: z.enum(categoryValues),
	baseDrink: z.number().refine((v) => drinkValues.includes(v as number))
});

export const deleteGameRuleBodySchema = z.object({
	ruleId: z.string().uuid()
});
