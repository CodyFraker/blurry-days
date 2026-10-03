import { z } from 'zod';

export const patchAdminVideoSchema = z
	.object({
		isHidden: z.boolean().optional(),
		sortOrder: z.number().int().nullable().optional(),
		title: z.string().min(1).optional(),
		description: z.string().nullable().optional()
	})
	.refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const createAdminVideoSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	publishedAt: z.string().datetime(),
	thumbnail: z.string().nullable().optional(),
	description: z.string().nullable().optional()
});
