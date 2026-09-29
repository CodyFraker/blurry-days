'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthHeader() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
	}

	if (!session?.user) {
		return (
			<button
				type="button"
				onClick={() => signIn('discord')}
				className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
			>
				Sign in with Discord
			</button>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<Link
				href="/my-games"
				className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
			>
				My games
			</Link>
			{session.user.image && (
				<img
					src={session.user.image}
					alt=""
					className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-600"
				/>
			)}
			<button
				type="button"
				onClick={() => signOut()}
				className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
			>
				Sign out
			</button>
		</div>
	);
}
