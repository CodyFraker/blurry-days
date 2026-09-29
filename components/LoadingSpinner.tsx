export function LoadingSpinner({ label }: { label: string }) {
	return (
		<div className="flex flex-col items-center gap-4 py-16 text-gray-500 dark:text-gray-400">
			<div className="loading" />
			<p>{label}</p>
		</div>
	);
}
