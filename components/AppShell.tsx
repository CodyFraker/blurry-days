import Link from 'next/link';
import { AdminNavLink } from '@/components/AdminNavLink';
import { AuthHeader } from '@/components/AuthHeader';
import { FilmGrainOverlay } from '@/components/brand/FilmGrainOverlay';
import { FilmPerforationDivider } from '@/components/brand/FilmPerforationDivider';
import { LogoMark } from '@/components/brand/LogoMark';

const navLinkClass =
	'text-sm font-medium text-gray-600 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-300';

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
			<FilmGrainOverlay />
			<header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
				<div className="mx-auto flex max-w-6xl flex-nowrap items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
					<Link
						href="/"
						className="min-w-0 shrink rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
					>
						<h1 className="flex min-w-0 items-center gap-2 truncate text-xl font-bold tracking-tight hover:text-indigo-700 sm:text-2xl dark:hover:text-indigo-300">
							<LogoMark className="h-7 w-7 shrink-0 text-indigo-600 dark:text-indigo-400" />
							blurrydays
						</h1>
						<p className="text-sm text-gray-500 max-sm:hidden dark:text-gray-400">
							drinking game generator
						</p>
					</Link>
					<nav
						className="flex shrink-0 items-center justify-end gap-2 sm:gap-4"
						aria-label="Main"
					>
						<Link href="/rules" className={navLinkClass}>
							Rules
						</Link>
						<AuthHeader>
							<AdminNavLink variant="menu" />
						</AuthHeader>
					</nav>
				</div>
			</header>
			<main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-4 sm:px-6 sm:py-8">
				{children}
			</main>
			<footer className="border-t border-gray-200 bg-white py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
				<FilmPerforationDivider className="mb-4 max-w-xl" />
				<p>&copy; {new Date().getFullYear()} Grainydays Drinking Game Generator</p>
			</footer>
		</div>
	);
}
