import Link from 'next/link';

const linkClass =
	'text-sm font-medium text-gray-600 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-300';
const activeClass =
	'text-sm font-medium text-indigo-600 dark:text-indigo-400';

const items = [
	{ href: '/admin', label: 'Overview', exact: true },
	{ href: '/admin/rules', label: 'Rules' },
	{ href: '/admin/games', label: 'Games' },
	{ href: '/admin/videos', label: 'Videos' },
	{ href: '/admin/votes', label: 'Votes' },
	{ href: '/admin/system', label: 'System' }
] as const;

export function AdminSubNav({ pathname }: { pathname: string }) {
	return (
		<nav className="flex flex-wrap gap-3 border-b border-gray-200 pb-4 dark:border-gray-700" aria-label="Admin">
			{items.map((item) => {
				const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
				return (
					<Link key={item.href} href={item.href} className={active ? activeClass : linkClass}>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
