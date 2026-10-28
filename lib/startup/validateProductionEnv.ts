export function validateProductionEnv(): void {
	const missing: string[] = [];

	if (!process.env.AUTH_SECRET?.trim()) {
		missing.push('AUTH_SECRET');
	}
	if (!process.env.DATABASE_URL?.trim()) {
		missing.push('DATABASE_URL');
	}
	if (!process.env.ADMIN_DISCORD_IDS?.trim()) {
		missing.push('ADMIN_DISCORD_IDS');
	}

	if (missing.length > 0) {
		throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
	}
}
