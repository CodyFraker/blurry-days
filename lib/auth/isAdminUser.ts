import { isAdminDiscordId } from '@/lib/auth/adminDiscordIds';
import { getDiscordAccountIdForUser } from '@/lib/auth/getDiscordAccountId';

export async function isAdminUser(userId: string): Promise<boolean> {
	const discordId = await getDiscordAccountIdForUser(userId);
	if (!discordId) {
		return false;
	}
	return isAdminDiscordId(discordId);
}
