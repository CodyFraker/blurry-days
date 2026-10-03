import { ShutterSpinner } from '@/components/brand/ShutterSpinner';

export function GameSummaryStickyActions({
	isGenerating,
	onGenerate
}: {
	isGenerating: boolean;
	onGenerate: () => void;
}) {
	return (
		<div
			className="fixed inset-x-0 bottom-0 z-20 flex border-t border-gray-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden dark:border-gray-700 dark:bg-gray-800/95"
		>
			<button
				type="button"
				onClick={onGenerate}
				disabled={isGenerating}
				className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
			>
				{isGenerating ? (
					<>
						<ShutterSpinner className="h-5 w-5" />
						Creating Game...
					</>
				) : (
					'Generate Game'
				)}
			</button>
		</div>
	);
}
