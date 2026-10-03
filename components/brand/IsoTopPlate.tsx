export function IsoTopPlate({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-600 dark:bg-gray-900/40">
			<span className="mb-2 hidden text-xs font-medium tracking-wider text-gray-500 sm:block dark:text-gray-400">
				ASA
			</span>
			<div
				className="pointer-events-none absolute inset-x-3 top-8 hidden h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent sm:block dark:via-gray-600"
				aria-hidden
			/>
			{children}
		</div>
	);
}
