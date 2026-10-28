import { createGameBodySchema } from '@/lib/games/schemas';

export { createGameBodySchema, type CreateGameBody } from '@/lib/games/schemas';

export function validateCreateGameBody(body: unknown) {
	return createGameBodySchema.safeParse(body);
}
