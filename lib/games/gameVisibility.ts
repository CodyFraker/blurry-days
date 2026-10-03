import { and, eq, gte, or } from 'drizzle-orm';
import { games } from '@/lib/db/schema';

export type GamePlayabilityFields = {
	isActive: boolean;
	expiresNever: boolean;
	expiresAt: Date;
};

export function isGamePlayable(game: GamePlayabilityFields, now: Date = new Date()): boolean {
	if (!game.isActive) {
		return false;
	}
	if (game.expiresNever) {
		return true;
	}
	return game.expiresAt >= now;
}

export function playableGameFilter(now: Date = new Date()) {
	return and(
		eq(games.isActive, true),
		or(eq(games.expiresNever, true), gte(games.expiresAt, now))
	);
}
