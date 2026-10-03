'use client';

import { useMemo, useState } from 'react';
import type { YoutubeVideo } from '@/lib/db/schema';
import {
	getYoutubeThumbnailFallbackUrls,
	getYoutubeThumbnailUrl
} from '@/lib/youtube/thumbnailUrl';
import {
	formatVideoMetaSegments,
	parseVideoDescriptionExtras
} from '@/lib/youtube/videoDescriptionExtras';

export type VideoWithGameCount = YoutubeVideo & { gameCount: number };

function ViewfinderFrame({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative h-[4.5rem] w-[8rem] shrink-0 overflow-hidden rounded-md bg-black">
			{children}
			<span
				className="pointer-events-none absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 border-r-2 border-t-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-white/80"
				aria-hidden
			/>
		</div>
	);
}

export function VideoListItem({
	video,
	onCreateGame,
	disabled
}: {
	video: VideoWithGameCount;
	onCreateGame: () => void;
	disabled?: boolean;
}) {
	const fallbackUrls = useMemo(
		() => getYoutubeThumbnailFallbackUrls(video.id, video.thumbnail),
		[video.id, video.thumbnail]
	);
	const [thumbIndex, setThumbIndex] = useState(0);
	const thumbSrc = fallbackUrls[thumbIndex] ?? getYoutubeThumbnailUrl(video.id);

	const extras = parseVideoDescriptionExtras(video.description);
	const metaLine = formatVideoMetaSegments(
		new Date(video.publishedAt),
		video.gameCount,
		extras
	).join(' · ');

	function onThumbError() {
		setThumbIndex((i) => (i < fallbackUrls.length - 1 ? i + 1 : i));
	}

	return (
		<div
			className="flex items-center gap-3 rounded-xl border border-gray-200 border-t-gray-100 bg-white px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:border-t-gray-600 dark:bg-gray-800 dark:hover:border-gray-600"
		>
			<ViewfinderFrame>
				<img
					src={thumbSrc}
					alt=""
					loading="lazy"
					onError={onThumbError}
					className="h-full w-full scale-[1.08] object-cover"
				/>
			</ViewfinderFrame>
			<div className="min-w-0 flex-1">
				<h3 className="line-clamp-1 text-base font-semibold text-gray-900 dark:text-gray-50">
					{video.title}
				</h3>
				<p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{metaLine}</p>
			</div>
			<button
				type="button"
				onClick={onCreateGame}
				disabled={disabled}
				aria-label={`Create game for ${video.title}`}
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-lg transition hover:border-emerald-500 hover:bg-emerald-600 hover:text-white disabled:opacity-60 dark:border-gray-500 dark:bg-gray-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-600"
			>
				<span aria-hidden>🎲</span>
			</button>
		</div>
	);
}
