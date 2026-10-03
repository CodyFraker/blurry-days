const DISCORD_SNOWFLAKE = /^\d+$/;

function parseAdminDiscordIdsFromEnv(raw: string): readonly string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const segment of raw.split(',')) {
		const trimmed = segment.trim();
		if (!trimmed) {
			continue;
		}
		if (!DISCORD_SNOWFLAKE.test(trimmed)) {
			if (process.env.NODE_ENV === 'development') {
				console.warn(`Ignoring invalid ADMIN_DISCORD_IDS entry: ${trimmed}`);
			}
			continue;
		}
		if (!seen.has(trimmed)) {
			seen.add(trimmed);
			result.push(trimmed);
		}
	}

	return result;
}

export function getAdminDiscordIds(): readonly string[] {
	return parseAdminDiscordIdsFromEnv(process.env.ADMIN_DISCORD_IDS ?? '');
}

export function isAdminDiscordId(id: string): boolean {
	return getAdminDiscordIds().includes(id);
}
