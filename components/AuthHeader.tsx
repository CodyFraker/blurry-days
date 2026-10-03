'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthHeader() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <div className="h-11 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
	}

	if (!session?.user) {
		return (
			<button
				type="button"
				onClick={() => signIn('discord')}
				className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
			>
				Sign in with Discord
			</button>
		);
	}

	return (
		<div className="flex flex-wrap items-center justify-end gap-2 max-sm:w-full max-sm:justify-between">
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
				className="min-h-11 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
			>
				Sign out
			</button>
		</div>
	);
}
