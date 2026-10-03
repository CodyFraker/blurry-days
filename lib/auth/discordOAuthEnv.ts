export function readDiscordOAuthEnv(): { clientId: string; clientSecret: string } {
	const clientId =
		process.env.DISCORD_CLIENT_ID?.trim() || process.env.AUTH_DISCORD_ID?.trim() || '';
	const clientSecret =
		process.env.DISCORD_CLIENT_SECRET?.trim() ||
		process.env.AUTH_DISCORD_SECRET?.trim() ||
		'';

	if (!clientId || !/^\d+$/.test(clientId)) {
		throw new Error(
			'DISCORD_CLIENT_ID is missing or invalid. Set it in .env or .env.local (Discord application client ID snowflake).'
		);
	}

	if (!clientSecret) {
		throw new Error(
			'DISCORD_CLIENT_SECRET is missing. Set it in .env or .env.local from the Discord Developer Portal.'
		);
	}

	return { clientId, clientSecret };
}
