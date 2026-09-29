import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export type SessionUser = {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

export async function requireSession(): Promise<
	{ user: SessionUser } | { response: NextResponse }
> {
	const session = await auth();
	if (!session?.user?.id) {
		return {
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		};
	}
	return {
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image
		}
	};
}
