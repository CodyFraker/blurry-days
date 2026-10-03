import Link from 'next/link';

export function AdminForbidden() {
	return (
		<div className="mx-auto max-w-lg space-y-4 py-12 text-center">
			<h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
				Access denied
			</h1>
			<p className="text-gray-600 dark:text-gray-400">
				You are signed in, but this account is not authorized to use the admin control panel.
			</p>
			<p>
				<Link
					href="/"
					className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
				>
					Return home
				</Link>
			</p>
		</div>
	);
}
