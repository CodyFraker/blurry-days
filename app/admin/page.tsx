import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { getDiscordAccountIdForUser } from '@/lib/auth/getDiscordAccountId';

function maskDiscordId(id: string): string {
	if (id.length <= 4) {
		return `…${id}`;
	}
	return `…${id.slice(-4)}`;
}

const cardClass =
	'rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800';

const sections = [
	{
		href: '/admin/rules',
		title: 'Rule catalog',
		description: 'Create and edit rule templates used in generated games.'
	},
	{
		href: '/admin/games',
		title: 'Games moderation',
		description: 'Review shared games, expiry, and active status.'
	},
	{
		href: '/admin/videos',
		title: 'Videos',
		description: 'YouTube sync, visibility, and catalog management.'
	},
	{
		href: '/admin/votes',
		title: 'Rule votes',
		description: 'Moderation and stats for community rule ratings.'
	},
	{
		href: '/admin/system',
		title: 'System',
		description: 'Dashboard, health checks, and audit log.'
	}
];

export default async function AdminPage() {
	const session = await auth();
	const discordAccountId = session?.user?.id
		? await getDiscordAccountIdForUser(session.user.id)
		: null;
	const discordHint = discordAccountId ? maskDiscordId(discordAccountId) : null;

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin control panel</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Manage Grainydays site content and moderation tools.
				</p>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Signed in as {session?.user?.name ?? 'Unknown user'}
					{discordHint ? ` (Discord ID ${discordHint})` : null}
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{sections.map((section) => (
					<section key={section.href} className={cardClass} aria-labelledby={`admin-${section.href}`}>
						<h2 id={`admin-${section.href}`} className="text-lg font-semibold">
							{section.title}
						</h2>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
						<p className="mt-4">
							<Link
								href={section.href}
								className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								Open section
							</Link>
						</p>
					</section>
				))}
			</div>
		</div>
	);
}
