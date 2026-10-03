const DEFAULT_TTL_DAYS = 90;

export function getGameTtlDays(): number {
	const raw = process.env.GAME_TTL_DAYS;
	if (!raw) {
		return DEFAULT_TTL_DAYS;
	}
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return DEFAULT_TTL_DAYS;
	}
	return parsed;
}

export function computeDefaultGameExpiresAt(from: Date = new Date()): Date {
	const expiresAt = new Date(from);
	expiresAt.setDate(expiresAt.getDate() + getGameTtlDays());
	return expiresAt;
}
