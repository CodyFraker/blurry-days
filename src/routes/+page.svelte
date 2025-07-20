<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { YoutubeVideo as YouTubeVideo } from '$lib/db/schema';

	interface VideoWithGameCount extends YouTubeVideo {
		gameCount: number;
	}

	let videos: VideoWithGameCount[] = [];
	let displayedVideos: VideoWithGameCount[] = [];
	let isLoading = false;
	let error = '';
	let currentPage = 0;
	const videosPerPage = 10;
	let loadingMore = false;
	let hasMoreVideos = true;
	let loadMoreTrigger: HTMLElement;
	let observer: IntersectionObserver;

	onMount(async () => {
		try {
			const response = await fetch('/api/videos');
			if (!response.ok) {
				throw new Error('Failed to fetch videos from API');
			}
			const allVideos = await response.json();
			videos = allVideos as VideoWithGameCount[];
			loadNextPage();
		} catch (err) {
			error = 'Failed to load videos';
			console.error(err);
		}

		// Setup intersection observer for lazy loading
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && hasMoreVideos && !loadingMore) {
						loadNextPage();
					}
				});
			},
			{ threshold: 0.1 }
		);

		// Cleanup function
		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});

	function loadNextPage() {
		if (loadingMore || !hasMoreVideos) return;
		
		loadingMore = true;
		const startIndex = currentPage * videosPerPage;
		const endIndex = startIndex + videosPerPage;
		const newVideos = videos.slice(startIndex, endIndex);
		
		if (newVideos.length > 0) {
			displayedVideos = [...displayedVideos, ...newVideos];
			currentPage++;
			hasMoreVideos = endIndex < videos.length;
		} else {
			hasMoreVideos = false;
		}
		
		loadingMore = false;
	}

	function createGame(video: VideoWithGameCount) {
		isLoading = true;
		const params = new URLSearchParams();
		params.set('videoId', video.id);
		goto(`/game-summary?${params.toString()}`);
	}

	// Watch for loadMoreTrigger element and observe it
	$: if (loadMoreTrigger && observer) {
		observer.observe(loadMoreTrigger);
	}
</script>

<div class="home-container">
	<div class="hero">
		<h2 class="hero-title">Choose Your Video</h2>
		<p class="hero-subtitle">Select a film photography video to generate a custom drinking game</p>
	</div>

	{#if error}
		<div class="error-message">
			<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
			</svg>
			{error}
		</div>
	{/if}

	{#if displayedVideos.length > 0}
		<div class="videos-list">
			{#each displayedVideos as video (video.id)}
				<div class="video-item">
					<div class="video-thumbnail-wrapper">
						<img
							src={video.thumbnail || ''}
							alt={video.title}
							class="video-thumbnail"
						/>
					</div>
					<div class="video-details">
						<h3 class="video-title">{video.title}</h3>
						<div class="video-stats">
							<span class="game-count">
								{video.gameCount} {video.gameCount === 1 ? 'game' : 'games'} created
							</span>
						</div>
						<button
							on:click={() => createGame(video)}
							disabled={isLoading}
							class="create-game-btn"
						>
							{#if isLoading}
								<span class="loading"></span>
								<span>Loading...</span>
							{:else}
								<span>🎲</span>
								<span>Create Game</span>
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Load more trigger -->
		{#if hasMoreVideos}
			<div class="load-more-trigger" bind:this={loadMoreTrigger}>
				{#if loadingMore}
					<div class="loading-more">
						<div class="loading"></div>
						<span>Loading more videos...</span>
					</div>
				{/if}
			</div>
		{:else if displayedVideos.length > 0}
			<div class="end-message">
				<p>You've reached the end! 🎉</p>
				<p class="end-subtitle">All {videos.length} videos loaded</p>
			</div>
		{/if}
	{:else if !error}
		<div class="loading-state">
			<div class="loading"></div>
			<p>Loading videos...</p>
		</div>
	{/if}
</div>

<style>
	.home-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem 0;
	}

	.hero-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 1rem 0;
		letter-spacing: -0.025em;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		margin: 0;
		max-width: 600px;
		margin: 0 auto;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		font-weight: 500;
	}

	.error-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.videos-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.video-item {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.video-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.video-thumbnail-wrapper {
		flex-shrink: 0;
		width: 120px;
		height: 90px;
		border-radius: 8px;
		overflow: hidden;
	}

	.video-thumbnail {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.video-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.video-stats {
		margin-bottom: 1rem;
	}

	.game-count {
		font-size: 0.875rem;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
	}

	.create-game-btn {
		background: #10b981;
		color: #ffffff;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		align-self: flex-start;
	}

	.create-game-btn:hover:not(:disabled) {
		background: #059669;
		transform: scale(1.05);
	}

	.create-game-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.load-more-trigger {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
		min-height: 100px;
	}

	.loading-more {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: #6b7280;
	}

	.end-message {
		text-align: center;
		padding: 3rem 0;
		color: #6b7280;
	}

	.end-message p {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.end-subtitle {
		font-size: 0.875rem !important;
		font-weight: 400 !important;
		margin-top: 0.5rem !important;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem 0;
		color: #6b7280;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.video-item {
			flex-direction: column;
			text-align: center;
		}

		.video-thumbnail-wrapper {
			width: 100%;
			max-width: 300px;
			height: auto;
			aspect-ratio: 16/9;
			margin: 0 auto 1rem;
		}

		.video-details {
			align-items: center;
		}

		.create-game-btn {
			width: 100%;
			max-width: 200px;
		}
	}

	@media (max-width: 480px) {
		.home-container {
			padding: 0 0.5rem;
		}

		.hero {
			padding: 1.5rem 0;
			margin-bottom: 2rem;
		}

		.hero-title {
			font-size: 1.75rem;
		}

		.hero-subtitle {
			font-size: 0.875rem;
		}

		.video-item {
			padding: 0.75rem;
		}

		.video-thumbnail-wrapper {
			width: 100px;
			height: 75px;
		}

		.create-game-btn {
			padding: 0.625rem 1.25rem;
			font-size: 0.8rem;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.hero-title {
			color: #f9fafb;
		}

		.hero-subtitle {
			color: #9ca3af;
		}

		.video-item {
			background: #1f2937;
			border-color: #374151;
		}

		.video-title {
			color: #f9fafb;
		}

		.game-count {
			background: #374151;
			color: #d1d5db;
		}

		.error-message {
			background: #450a0a;
			border-color: #7f1d1d;
			color: #fca5a5;
		}
	}
</style>