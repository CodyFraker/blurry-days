'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyStateIllustration } from '@/components/brand/EmptyStateIllustration';
import { HomeHero } from '@/components/HomeHero';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { VideoListItem, type VideoWithGameCount } from '@/components/VideoListItem';

export default function HomePage() {
	const router = useRouter();
	const [videos, setVideos] = useState<VideoWithGameCount[]>([]);
	const [displayedVideos, setDisplayedVideos] = useState<VideoWithGameCount[]>([]);
	const [error, setError] = useState('');
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreVideos, setHasMoreVideos] = useState(true);
	const [navigating, setNavigating] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const videosPerPage = 10;

	const loadNextPage = useCallback(() => {
		if (loadingMore || !hasMoreVideos) return;
		setLoadingMore(true);
		setDisplayedVideos((prev) => {
			const startIndex = prev.length;
			const endIndex = startIndex + videosPerPage;
			const newVideos = videos.slice(startIndex, endIndex);
			if (newVideos.length === 0) {
				setHasMoreVideos(false);
				return prev;
			}
			setHasMoreVideos(endIndex < videos.length);
			return [...prev, ...newVideos];
		});
		setLoadingMore(false);
	}, [hasMoreVideos, loadingMore, videos]);

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch('/api/videos');
				if (!response.ok) throw new Error('Failed to fetch videos');
				const allVideos = (await response.json()) as VideoWithGameCount[];
				setVideos(allVideos);
			} catch {
				setError('Failed to load videos');
			}
		})();
	}, []);

	useEffect(() => {
		if (videos.length > 0 && displayedVideos.length === 0) {
			setDisplayedVideos(videos.slice(0, videosPerPage));
			setHasMoreVideos(videos.length > videosPerPage);
		}
	}, [videos, displayedVideos.length]);

	useEffect(() => {
		const el = loadMoreRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasMoreVideos && !loadingMore) {
					loadNextPage();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMoreVideos, loadingMore, loadNextPage]);

	function createGame(video: VideoWithGameCount) {
		setNavigating(true);
		router.push(`/game-summary?videoId=${encodeURIComponent(video.id)}`);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
				{error}
			</div>
		);
	}

	if (videos.length === 0 && !error) {
		return <LoadingSpinner label="Loading videos..." />;
	}

	return (
		<div>
			<HomeHero
				title="Choose Your Video"
				description="Select a film photography video to generate a custom drinking game"
				meta={
					<p className="text-sm text-gray-500 dark:text-gray-500">
						{videos.length} {videos.length === 1 ? 'video' : 'videos'}
					</p>
				}
			/>
			<div className="mx-auto max-w-3xl space-y-3">
				{displayedVideos.map((video) => (
					<VideoListItem
						key={video.id}
						video={video}
						onCreateGame={() => createGame(video)}
						disabled={navigating}
					/>
				))}
			</div>
			{hasMoreVideos && (
				<div ref={loadMoreRef} className="flex min-h-[100px] justify-center py-8">
					{loadingMore && <LoadingSpinner label="Loading more videos..." />}
				</div>
			)}
			{!hasMoreVideos && displayedVideos.length > 0 && (
				<div className="flex flex-col items-center py-8 text-center text-gray-500 dark:text-gray-400">
					<EmptyStateIllustration variant="endOfRoll" className="mb-4 h-20 w-20" />
					<p>You&apos;ve reached the end! All {videos.length} videos loaded.</p>
				</div>
			)}
		</div>
	);
}
