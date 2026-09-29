import Link from 'next/link';

export function ErrorPanel({
	title,
	message,
	homeHref = '/'
}: {
	title: string;
	message: string;
	homeHref?: string;
}) {
	return (
		<div className="mx-auto max-w-lg py-16 text-center">
			<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
				<h2 className="text-lg font-semibold">{title}</h2>
				<p className="mt-1 text-sm">{message}</p>
			</div>
			<Link
				href={homeHref}
				className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
			>
				Go Home
			</Link>
		</div>
	);
}
