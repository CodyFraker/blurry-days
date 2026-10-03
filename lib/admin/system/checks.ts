import { checkDatabaseConnection } from '@/lib/db';
import { RSS_FEED_URL } from '@/lib/youtube/rssParser';

export async function runSystemChecks() {
	const database = await checkDatabaseConnection();

	let rssReachable = false;
	try {
		const res = await fetch(RSS_FEED_URL, { method: 'GET', signal: AbortSignal.timeout(8000) });
		rssReachable = res.ok;
	} catch {
		rssReachable = false;
	}

	return {
		database: database ? 'connected' : 'disconnected',
		rssReachable,
		env: {
			authSecret: Boolean(process.env.AUTH_SECRET),
			discordOAuth: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
			adminDiscordIds: Boolean(process.env.ADMIN_DISCORD_IDS?.trim())
		}
	};
}
