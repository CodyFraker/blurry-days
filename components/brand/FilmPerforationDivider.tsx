export function FilmPerforationDivider({ className = '' }: { className?: string }) {
	return (
		<div
			className={`mx-auto flex h-6 max-w-3xl items-center justify-center gap-1.5 px-4 ${className}`}
			aria-hidden
		>
			{Array.from({ length: 12 }).map((_, i) => (
				<span
					key={i}
					className="h-3 w-2 rounded-sm bg-gray-300 dark:bg-gray-600"
				/>
			))}
		</div>
	);
}
