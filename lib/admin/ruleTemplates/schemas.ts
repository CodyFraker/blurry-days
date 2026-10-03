import { z } from 'zod';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';

const categoryValues = Object.values(CategoryEnum) as [string, ...string[]];
const drinkValues = Object.values(DrinkEnum) as [number, ...number[]];

const optionalCreateDescription = z
	.union([z.string().max(2000), z.literal('')])
	.optional()
	.transform((v) => (v === '' || v === undefined ? undefined : v));

export const createRuleTemplateSchema = z.object({
	text: z.string().min(1).max(2000),
	category: z.enum(categoryValues),
	weight: z.number().positive(),
	baseDrink: z.number().refine((v) => drinkValues.includes(v as number)),
	enabled: z.boolean().optional().default(true),
	description: optionalCreateDescription
});

export const updateRuleTemplateSchema = z
	.object({
		text: z.string().min(1).max(2000).optional(),
		category: z.enum(categoryValues).optional(),
		weight: z.number().positive().optional(),
		baseDrink: z.number().refine((v) => drinkValues.includes(v as number)).optional(),
		enabled: z.boolean().optional(),
		description: z.string().max(2000).nullable().optional()
	})
	.refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const listAdminRuleTemplatesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25),
	includeDisabled: z
		.union([z.literal('true'), z.literal('false')])
		.optional()
		.transform((v) => v !== 'false')
});
