import { z } from 'zod';

const ruleSchema = z.object({
	text: z.string().min(1),
	category: z.string().min(1),
	baseDrink: z.number(),
	isCustom: z.boolean().optional(),
	weight: z.number().optional()
});

export const createGameBodySchema = z.object({
	title: z.string().optional(),
	videoId: z.string().min(1),
	videoTitle: z.string().min(1),
	videoThumbnail: z.string().nullable().optional(),
	intoxicationLevel: z.number(),
	rules: z.array(ruleSchema).min(1)
});

export type CreateGameBody = z.infer<typeof createGameBodySchema>;

export function validateCreateGameBody(body: unknown) {
	return createGameBodySchema.safeParse(body);
}
