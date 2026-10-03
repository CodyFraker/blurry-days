import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';

export async function getDiscordAccountIdForUser(userId: string): Promise<string | null> {
	const [row] = await db
		.select({ providerAccountId: accounts.providerAccountId })
		.from(accounts)
		.where(and(eq(accounts.userId, userId), eq(accounts.provider, 'discord')))
		.limit(1);

	return row?.providerAccountId ?? null;
}
