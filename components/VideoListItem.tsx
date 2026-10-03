'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { YoutubeVideo } from '@/lib/db/schema';
import {
	getYoutubeThumbnailFallbackUrls,
	getYoutubeThumbnailUrl
} from '@/lib/youtube/thumbnailUrl';
import {
	formatGameCountLabel,
	formatVideoStatsSegments,
	parseVideoDescriptionExtras
} from '@/lib/youtube/videoDescriptionExtras';
import { ShutterIcon } from '@/components/brand/ShutterIcon';
import { ViewfinderFrame } from '@/components/brand/ViewfinderFrame';

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
	const fallbackUrls = useMemo(
		() => getYoutubeThumbnailFallbackUrls(video.id, video.thumbnail),
		[video.id, video.thumbnail]
	);
	const [thumbIndex, setThumbIndex] = useState(0);
	const thumbSrc = fallbackUrls[thumbIndex] ?? getYoutubeThumbnailUrl(video.id);

	const extras = parseVideoDescriptionExtras(video.description);
	const publishedLabel = new Date(video.publishedAt).toLocaleDateString();
	const metaTail = formatVideoStatsSegments(extras);

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
				<p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
					{publishedLabel}
					{' · '}
					<Link
						href={`/videos/${encodeURIComponent(video.id)}/games`}
						className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
					>
						{formatGameCountLabel(video.gameCount)}
					</Link>
					{metaTail.length > 0 ? ` · ${metaTail.join(' · ')}` : ''}
				</p>
			</div>
			<button
				type="button"
				onClick={onCreateGame}
				disabled={disabled}
				aria-label={`Create game for ${video.title}`}
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-lg transition hover:border-emerald-500 hover:bg-emerald-600 hover:text-white disabled:opacity-60 dark:border-gray-500 dark:bg-gray-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-600"
			>
				<ShutterIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
			</button>
		</div>
	);
}
