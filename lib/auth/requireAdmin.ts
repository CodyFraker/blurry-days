import { auth } from '@/lib/auth/config';
import { isAdminDiscordId } from '@/lib/auth/adminDiscordIds';
import { getDiscordAccountIdForUser } from '@/lib/auth/getDiscordAccountId';
import type { SessionUser } from '@/lib/auth/requireSession';
import { NextResponse } from 'next/server';

export async function requireAdmin(): Promise<
	{ user: SessionUser; discordAccountId: string } | { response: NextResponse }
> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		};
	}

	const discordAccountId = await getDiscordAccountIdForUser(session.user.id);
	if (!discordAccountId || !isAdminDiscordId(discordAccountId)) {
		return {
			response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		};
	}

	return {
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image
		},
		discordAccountId
	};
}
