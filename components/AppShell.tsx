import { AuthHeader } from '@/components/AuthHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50">
			<header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<div className="text-center sm:text-left">
						<h1 className="text-2xl font-bold tracking-tight">📸 Grainydays</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">Drinking Game Generator</p>
					</div>
					<AuthHeader />
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
			<footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
				<p>&copy; {new Date().getFullYear()} Grainydays Drinking Game Generator</p>
			</footer>
		</div>
	);
}
