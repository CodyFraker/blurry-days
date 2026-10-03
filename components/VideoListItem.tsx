'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { YoutubeVideoClient } from '@/lib/youtube/videoClientTypes';
import {
	getYoutubeThumbnailFallbackUrls,
	getYoutubeThumbnailUrl
} from '@/lib/youtube/thumbnailUrl';
import {
	formatGameCountLabel,
	parseVideoDescriptionExtras
} from '@/lib/youtube/videoDescriptionExtras';
import { ExternalLink } from 'lucide-react';
import { ShutterIcon } from '@/components/brand/ShutterIcon';
import { ViewfinderFrame } from '@/components/brand/ViewfinderFrame';
import { getYoutubeWatchUrl } from '@/lib/youtube/watchUrl';

export type VideoWithGameCount = YoutubeVideoClient & { gameCount: number };

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
				<div className="inline-flex max-w-full items-center gap-1.5">
					<h3 className="min-w-0 truncate text-base font-semibold text-gray-900 dark:text-gray-50">
						{video.title}
					</h3>
					<a
						href={getYoutubeWatchUrl(video.id)}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Watch ${video.title} on YouTube`}
						className="shrink-0 text-gray-500 transition hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
					>
						<ExternalLink className="h-4 w-4" aria-hidden />
					</a>
				</div>
				<p className="mt-0.5 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
					<span className="max-sm:hidden">
						{publishedLabel}
						{' · '}
					</span>
					<Link
						href={`/videos/${encodeURIComponent(video.id)}/games`}
						className="text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
					>
						{formatGameCountLabel(video.gameCount)}
					</Link>
					{extras.duration ? ` · ${extras.duration}` : ''}
					{extras.views ? (
						<span className="max-sm:hidden">
							{' · '}
							{extras.views} views
						</span>
					) : null}
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
