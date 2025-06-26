<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { YouTubeVideo } from '$lib/youtube/rssParser';
	import { getMockVideos } from '$lib/youtube/rssParser';
	import '@fontsource/oswald/700.css'; // Use Oswald for a vintage look

	let videos: YouTubeVideo[] = [];
	let selectedVideo: YouTubeVideo | null = null;
	let intoxicationLevel = 2;
	let isLoading = false;
	let error = '';

	const isoValues: (number | 'PROGRAM')[] = [100, 200, 400, 800, 1600, 'PROGRAM'];
	let isoIndex = 0; // 0-4 for ISO, 5 for PROGRAM
	let selectedISO: number | 'PROGRAM' = isoValues[isoIndex] as number | 'PROGRAM';

	$: selectedISO = isoValues[isoIndex] as number | 'PROGRAM';

	onMount(async () => {
		try {
			// For now, use mock data until we implement the RSS parser
			videos = getMockVideos();
		} catch (err) {
			error = 'Failed to load videos';
			console.error(err);
		}
	});

	function selectVideo(video: YouTubeVideo) {
		selectedVideo = video;
	}

	function reviewAndConfirm() {
		if (!selectedVideo) return;

		const params = new URLSearchParams();
		params.set('videoId', selectedVideo.id);
		params.set('intoxicationLevel', intoxicationLevel.toString());
		goto(`/game-summary?${params.toString()}`);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function handleDialChange(e: Event) {
		isoIndex = +(e.target as HTMLInputElement).value;
		if (isoIndex === 5) {
			// PROGRAM: randomly select one of the ISO values
			const randomIdx = Math.floor(Math.random() * 5);
			selectedISO = isoValues[randomIdx] as number;
		} else {
			selectedISO = isoValues[isoIndex] as number;
		}
		intoxicationLevel = isoIndex + 1;
	}
</script>

<div class="home">
	<div class="hero">
		<h2>🎬 Choose Your Video</h2>
		<p>Select a recent Grainydays video to base your drinking game on</p>
	</div>

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	<div class="video-grid">
		{#each videos as video}
			<button 
				class="video-card {selectedVideo?.id === video.id ? 'selected' : ''}"
				on:click={() => selectVideo(video)}
				on:keydown={(e) => e.key === 'Enter' && selectVideo(video)}
				type="button"
				aria-label="Select video: {video.title}"
			>
				<div class="video-thumbnail">
					<img src={video.thumbnail} alt={video.title} />
					<div class="video-overlay">
						<span class="play-icon">▶</span>
					</div>
				</div>
				<div class="video-info">
					<h3>{video.title}</h3>
					<p class="video-date">{formatDate(video.publishedAt)}</p>
				</div>
			</button>
		{/each}
	</div>

	{#if selectedVideo}
		<div class="game-config">
			<div class="card">
				<h3>🍻 Set Your Intoxication Level</h3>
				<p>How drunk do you want to get?</p>
				
				<div class="slider-container">
					<div class="iso-dial vintage">
						<svg viewBox="0 0 200 200" width="200" height="200" class="dial-svg">
							<!-- Knurled edge -->
							<defs>
								<radialGradient id="metal" cx="50%" cy="50%" r="50%">
									<stop offset="0%" stop-color="#444"/>
									<stop offset="100%" stop-color="#111"/>
								</radialGradient>
							</defs>
							<circle cx="100" cy="100" r="98" fill="url(#metal)" stroke="#888" stroke-width="2"/>
							<!-- Knurl effect -->
							<g class="knurl">
								{#each Array(40) as _, i}
									<rect x="98" y="2" width="4" height="16" rx="2" fill="#bbb" stroke="#222" stroke-width="0.5" transform="rotate({i*9} 100 100)" />
								{/each}
							</g>
							<!-- Dial face -->
							<circle cx="100" cy="100" r="80" fill="#181818" stroke="#444" stroke-width="2"/>
							<!-- Pointer -->
							<polygon points="100,18 108,38 92,38" fill="#ffd700" stroke="#222" stroke-width="2"/>
							<!-- Curved numbers -->
							<text class="dial-number" font-family="'Oswald', 'Courier New', monospace" font-size="20" fill="#fff">
								<textPath xlink:href="#arc1" startOffset="0%">100</textPath>
							</text>
							<text class="dial-number" font-family="'Oswald', 'Courier New', monospace" font-size="20" fill="#fff">
								<textPath xlink:href="#arc2" startOffset="0%">200</textPath>
							</text>
							<text class="dial-number" font-family="'Oswald', 'Courier New', monospace" font-size="20" fill="#fff">
								<textPath xlink:href="#arc3" startOffset="0%">400</textPath>
							</text>
							<text class="dial-number" font-family="'Oswald', 'Courier New', monospace" font-size="20" fill="#fff">
								<textPath xlink:href="#arc4" startOffset="0%">800</textPath>
							</text>
							<text class="dial-number" font-family="'Oswald', 'Courier New', monospace" font-size="20" fill="#fff">
								<textPath xlink:href="#arc5" startOffset="0%">1600</textPath>
							</text>
							<text class="dial-program" font-family="'Oswald', 'Courier New', monospace" font-size="18" fill="#00ff7f">
								<textPath xlink:href="#arc6" startOffset="0%">PROGRAM</textPath>
							</text>
							<!-- Arcs for text paths -->
							<path id="arc1" d="M 100 30 A 70 70 0 0 1 170 100" fill="none"/>
							<path id="arc2" d="M 170 100 A 70 70 0 0 1 100 170" fill="none"/>
							<path id="arc3" d="M 100 170 A 70 70 0 0 1 30 100" fill="none"/>
							<path id="arc4" d="M 30 100 A 70 70 0 0 1 100 30" fill="none"/>
							<path id="arc5" d="M 100 30 A 70 70 0 0 1 135 45" fill="none"/>
							<path id="arc6" d="M 135 45 A 70 70 0 0 1 100 30" fill="none"/>
						</svg>
						<input 
							type="range" 
							class="dial-input" 
							min="0" 
							max="5" 
							step="1"
							bind:value={isoIndex}
							on:input={handleDialChange}
						/>
						<div class="dial-center vintage">
							<span class="current-value">{selectedISO}</span>
						</div>
					</div>
					<div class="dial-labels vintage">
						<span>100</span>
						<span>200</span>
						<span>400</span>
						<span>800</span>
						<span>1600</span>
						<span class="program-label">PROGRAM</span>
					</div>
				</div>

				<div class="selected-video">
					<h4>Selected Video:</h4>
					<p>{selectedVideo.title}</p>
				</div>

				<button 
					class="btn generate-btn" 
					on:click={reviewAndConfirm}
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="loading"></span>
						Review & Confirm
					{:else}
						🎲 Review & Confirm
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.home {
		max-width: 1000px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	.hero h2 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		color: #ffd700;
	}

	.hero p {
		font-size: 1.2rem;
		color: #ccc;
	}

	.error-message {
		background: rgba(220, 53, 69, 0.2);
		border: 2px solid #dc3545;
		color: #ff6b6b;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 2rem;
		text-align: center;
	}

	.video-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.video-card {
		background: rgba(45, 45, 45, 0.9);
		border: 2px solid #8b4513;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		width: 100%;
		padding: 0;
		margin: 0;
		font-family: inherit;
		text-align: left;
	}

	.video-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
		border-color: #ffd700;
	}

	.video-card:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
	}

	.video-card.selected {
		border-color: #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
	}

	.video-thumbnail {
		position: relative;
		width: 100%;
		height: 180px;
		overflow: hidden;
	}

	.video-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.video-card:hover .video-overlay {
		opacity: 1;
	}

	.play-icon {
		font-size: 3rem;
		color: #fff;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.video-info {
		padding: 1rem;
	}

	.video-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #f5f5f5;
		line-height: 1.4;
	}

	.video-date {
		margin: 0;
		color: #999;
		font-size: 0.9rem;
	}

	.game-config {
		max-width: 600px;
		margin: 0 auto;
	}

	.game-config h3 {
		color: #ffd700;
		margin-bottom: 1rem;
	}

	.game-config p {
		color: #ccc;
		margin-bottom: 2rem;
	}

	/* ISO Dial Styles */
	.iso-dial.vintage {
		position: relative;
		width: 200px;
		height: 200px;
		margin: 0 auto 2rem;
	}
	.dial-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 200px;
		height: 200px;
		z-index: 1;
	}
	.knurl rect {
		filter: brightness(0.8);
	}
	.dial-center.vintage {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
		border: 2px solid #8b4513;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 
			inset 0 1px 3px rgba(0, 0, 0, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.3);
		z-index: 2;
	}
	.current-value {
		font-size: 1.5rem;
		font-weight: bold;
		color: #ffd700;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		font-family: 'Oswald', 'Courier New', monospace;
	}
	.dial-input {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		z-index: 3;
	}
	.dial-labels.vintage {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
		font-size: 0.9rem;
		color: #ccc;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
		font-family: 'Oswald', 'Courier New', monospace;
	}
	.dial-labels .program-label {
		color: #00ff7f;
		font-weight: bold;
	}
	.dial-number {
		font-family: 'Oswald', 'Courier New', monospace;
		font-weight: bold;
		letter-spacing: 1px;
	}
	.dial-program {
		font-family: 'Oswald', 'Courier New', monospace;
		font-weight: bold;
		letter-spacing: 2px;
		fill: #00ff7f;
	}
	.selected-video {
		margin: 2rem 0;
		padding: 1rem;
		background: rgba(139, 69, 19, 0.2);
		border-radius: 4px;
		border-left: 4px solid #ffd700;
	}

	.selected-video h4 {
		margin: 0 0 0.5rem 0;
		color: #ffd700;
	}

	.selected-video p {
		margin: 0;
		color: #f5f5f5;
	}

	.generate-btn {
		width: 100%;
		font-size: 1.2rem;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.hero h2 {
			font-size: 2rem;
		}

		.video-grid {
			grid-template-columns: 1fr;
		}

		.video-thumbnail {
			height: 150px;
		}
	}

	.dial-labels .program-label {
		color: #00ff7f;
		font-weight: bold;
	}
</style> 