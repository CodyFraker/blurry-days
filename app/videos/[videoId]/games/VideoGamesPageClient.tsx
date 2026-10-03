'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyStateIllustration } from '@/components/brand/EmptyStateIllustration';
import { filmEdgeCardClassName } from '@/components/brand/FilmEdgeCard';
import { ViewfinderFrame } from '@/components/brand/ViewfinderFrame';
import { getYoutubeThumbnailUrl } from '@/lib/youtube/thumbnailUrl';

type VideoGamesPayload = {
	video: {
		id: string;
		title: string;
		thumbnail: string | null;
	};
	games: {
		id: string;
		title: string;
		videoTitle: string;
		videoThumbnail: string | null;
		intoxicationLevel: number;
		createdAt: string;
		expiresAt: string;
	}[];
};

type VideoGamesPageClientProps = {
	videoId: string;
};

export default function VideoGamesPageClient({ videoId }: VideoGamesPageClientProps) {
	const [data, setData] = useState<VideoGamesPayload | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/videos/${encodeURIComponent(videoId)}/games`);
				if (res.status === 404) {
					setError('Video not found');
					return;
				}
				if (!res.ok) throw new Error('Failed to load');
				setData(await res.json());
			} catch {
				setError('Failed to load games for this video');
			} finally {
				setLoading(false);
			}
		})();
	}, [videoId]);

	if (loading) {
		return <LoadingSpinner label="Loading games..." />;
	}

	if (error || !data) {
		return (
			<div className="mx-auto max-w-md py-16 text-center">
				<p className="text-red-600 dark:text-red-400">{error || 'Video not found'}</p>
				<Link href="/" className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400">
					Back to videos
				</Link>
			</div>
		);
	}

	const thumbSrc =
		data.video.thumbnail ?? getYoutubeThumbnailUrl(data.video.id);

	return (
		<div>
			<Link
				href="/"
				className="text-sm text-gray-600 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-indigo-300"
			>
				← All videos
			</Link>
			<div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
				<ViewfinderFrame size="md">
					<img src={thumbSrc} alt="" className="h-full w-full scale-[1.05] object-cover" />
				</ViewfinderFrame>
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.video.title}</h2>
					<p className="mt-1 text-gray-600 dark:text-gray-400">
						{data.games.length} {data.games.length === 1 ? 'game' : 'games'}
					</p>
				</div>
			</div>
			{data.games.length === 0 ? (
				<div className="mt-10 flex flex-col items-center text-center text-gray-600 dark:text-gray-400">
					<EmptyStateIllustration variant="noVideoGames" className="mb-4 h-20 w-20" />
					<p>
						No games for this video yet.{' '}
						<Link
							href={`/game-summary?videoId=${encodeURIComponent(data.video.id)}`}
							className="text-blue-600 hover:underline dark:text-blue-400"
						>
							Create one
						</Link>
						.
					</p>
				</div>
			) : (
				<ul className="mt-8 grid gap-4 sm:grid-cols-2">
					{data.games.map((game) => (
						<li key={game.id}>
							<Link
								href={`/game/${game.id}`}
								className={filmEdgeCardClassName(
									'block rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
								)}
							>
								<h3 className="font-semibold text-gray-900 dark:text-white">{game.title}</h3>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									Created {new Date(game.createdAt).toLocaleDateString()}
								</p>
								<p className="mt-1 text-xs text-gray-500">
									Expires {new Date(game.expiresAt).toLocaleDateString()}
								</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
