import type { YoutubeVideo } from '@/lib/db/schema';

export type VideoWithGameCount = YoutubeVideo & { gameCount: number };

export function VideoListItem({
	video,
	onCreateGame,
	disabled
}: {
	video: VideoWithGameCount;
	onCreateGame: () => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row dark:border-gray-700 dark:bg-gray-800">
			<div className="mx-auto h-[90px] w-full max-w-[300px] shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:h-[90px] sm:w-[120px]">
				<img
					src={video.thumbnail || ''}
					alt={video.title}
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="flex min-w-0 flex-1 flex-col justify-between">
				<div>
					<h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
						{video.title}
					</h3>
					<span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-0.5 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
						{video.gameCount} {video.gameCount === 1 ? 'game' : 'games'} created
					</span>
				</div>
				<button
					type="button"
					onClick={onCreateGame}
					disabled={disabled}
					className="mt-4 inline-flex w-full max-w-[200px] items-center justify-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 sm:self-auto"
				>
					<span>🎲</span>
					<span>Create Game</span>
				</button>
			</div>
		</div>
	);
}
