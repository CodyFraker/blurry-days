import { z } from 'zod';

export const listAdminGamesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25),
	q: z.string().optional(),
	userId: z.string().optional(),
	videoId: z.string().optional(),
	active: z.enum(['true', 'false']).optional(),
	expired: z.enum(['true', 'false']).optional(),
	expiresNever: z.enum(['true', 'false']).optional()
});

export const patchAdminGameSchema = z
	.object({
		isActive: z.boolean().optional(),
		expiresAt: z.string().datetime().optional(),
		expiresNever: z.boolean().optional()
	})
	.refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });
