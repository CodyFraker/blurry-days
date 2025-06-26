<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { YouTubeVideo } from '$lib/youtube/rssParser';
	import { getMockVideos } from '$lib/youtube/rssParser';

	interface GameSettings {
		videoId: string;
		videoTitle: string;
		videoThumbnail: string;
		intoxicationLevel: number;
	}

	let gameSettings: GameSettings | null = null;
	let videos: YouTubeVideo[] = [];
	let isLoading = false;
	let error = '';

	const isoValues: (number | 'PROGRAM')[] = [100, 200, 400, 800, 1600, 'PROGRAM'];
	let isoIndex = 0;
	let selectedISO: number | 'PROGRAM' = isoValues[isoIndex] as number | 'PROGRAM';

	$: selectedISO = isoValues[isoIndex] as number | 'PROGRAM';

	onMount(async () => {
		try {
			videos = getMockVideos();
			loadGameSettings();
		} catch (err) {
			error = 'Failed to load data';
			console.error(err);
		}
	});

	function loadGameSettings() {
		const params = new URLSearchParams(window.location.search);
		const videoId = params.get('videoId');
		const intoxicationLevel = parseInt(params.get('intoxicationLevel') || '2');

		if (!videoId) {
			error = 'No video selected';
			return;
		}

		const video = videos.find(v => v.id === videoId);
		if (!video) {
			error = 'Video not found';
			return;
		}

		gameSettings = {
			videoId: video.id,
			videoTitle: video.title,
			videoThumbnail: video.thumbnail,
			intoxicationLevel
		};

		// Set the ISO dial to match the intoxication level
		isoIndex = intoxicationLevel - 1;
	}

	function selectVideo(video: YouTubeVideo) {
		if (gameSettings) {
			gameSettings.videoId = video.id;
			gameSettings.videoTitle = video.title;
			gameSettings.videoThumbnail = video.thumbnail;
		}
	}

	function handleDialChange(e: Event) {
		isoIndex = +(e.target as HTMLInputElement).value;
		if (isoIndex === 5) {
			const randomIdx = Math.floor(Math.random() * 5);
			selectedISO = isoValues[randomIdx] as number;
		} else {
			selectedISO = isoValues[isoIndex] as number;
		}

		if (gameSettings) {
			gameSettings.intoxicationLevel = isoIndex + 1;
		}
	}

	async function generateGame() {
		if (!gameSettings) return;

		isLoading = true;
		try {
			const response = await fetch('/api/games', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					videoThumbnail: gameSettings.videoThumbnail,
					intoxicationLevel: gameSettings.intoxicationLevel
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create game');
			}

			const game = await response.json();
			goto(`/game/${game.id}`);
		} catch (err) {
			error = 'Failed to generate game';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	function goBack() {
		const params = new URLSearchParams();
		if (gameSettings) {
			params.set('videoId', gameSettings.videoId);
			params.set('intoxicationLevel', gameSettings.intoxicationLevel.toString());
		}
		goto(`/?${params.toString()}`);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function getIntoxicationLabel(level: number): string {
		const labels = ['Tipsy', 'Buzzed', 'Drunk', 'Wasted', 'Blackout'];
		return labels[level - 1] || 'Unknown';
	}
</script>

<div class="game-summary">
	<div class="hero">
		<h2>🎯 Review Your Game Settings</h2>
		<p>Make any final adjustments before generating your drinking game</p>
	</div>

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	{#if gameSettings}
		<div class="summary-grid">
			<!-- Current Settings -->
			<div class="current-settings card">
				<h3>📋 Current Settings</h3>
				
				<div class="selected-video-display">
					<img src={gameSettings.videoThumbnail} alt={gameSettings.videoTitle} />
					<div class="video-info">
						<h4>{gameSettings.videoTitle}</h4>
						<p class="intoxication-display">
							🍻 Intoxication Level: {getIntoxicationLabel(gameSettings.intoxicationLevel)}
						</p>
					</div>
				</div>
			</div>

			<!-- Modify Settings -->
			<div class="modify-settings card">
				<h3>⚙️ Modify Settings</h3>
				
				<!-- Video Selection -->
				<div class="setting-section">
					<h4>🎬 Choose Different Video</h4>
					<div class="video-options">
						{#each videos as video}
							<button 
								class="video-option {gameSettings.videoId === video.id ? 'selected' : ''}"
								on:click={() => selectVideo(video)}
								on:keydown={(e) => e.key === 'Enter' && selectVideo(video)}
								type="button"
								aria-label="Select video: {video.title}"
							>
								<img src={video.thumbnail} alt={video.title} />
								<div class="video-details">
									<p class="video-title">{video.title}</p>
									<p class="video-date">{formatDate(video.publishedAt)}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Intoxication Level -->
				<div class="setting-section">
					<h4>🍻 Adjust Intoxication Level</h4>
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
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons">
			<button class="btn btn-secondary" on:click={goBack}>
				← Back to Selection
			</button>
			<button 
				class="btn btn-primary" 
				on:click={generateGame}
				disabled={isLoading}
			>
				{#if isLoading}
					<span class="loading"></span>
					Generating...
				{:else}
					🎲 Generate Drinking Game
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.game-summary {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
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

	.summary-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.card {
		background: rgba(45, 45, 45, 0.9);
		border: 2px solid #8b4513;
		border-radius: 8px;
		padding: 2rem;
	}

	.card h3 {
		color: #ffd700;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.selected-video-display {
		display: flex;
		gap: 1rem;
		align-items: start;
	}

	.selected-video-display img {
		width: 120px;
		height: 90px;
		object-fit: cover;
		border-radius: 4px;
		border: 2px solid #8b4513;
	}

	.video-info h4 {
		margin: 0 0 0.5rem 0;
		color: #f5f5f5;
		font-size: 1.1rem;
		line-height: 1.4;
	}

	.intoxication-display {
		margin: 0;
		color: #ffd700;
		font-weight: bold;
	}

	.setting-section {
		margin-bottom: 2rem;
	}

	.setting-section h4 {
		color: #ffd700;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.setting-section p {
		color: #ccc;
		margin-bottom: 1rem;
	}

	.video-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.video-option {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
		background: none;
		font-family: inherit;
		text-align: left;
	}

	.video-option:hover {
		background: rgba(139, 69, 19, 0.2);
		border-color: #8b4513;
	}

	.video-option:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
	}

	.video-option.selected {
		background: rgba(255, 215, 0, 0.1);
		border-color: #ffd700;
	}

	.video-option img {
		width: 80px;
		height: 60px;
		object-fit: cover;
		border-radius: 4px;
	}

	.video-details {
		flex: 1;
	}

	.video-title {
		margin: 0 0 0.25rem 0;
		color: #f5f5f5;
		font-size: 0.9rem;
		line-height: 1.3;
	}

	.video-date {
		margin: 0;
		color: #999;
		font-size: 0.8rem;
	}

	/* ISO Dial Styles */
	.slider-container {
		text-align: center;
	}

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

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.btn {
		padding: 1rem 2rem;
		border: none;
		border-radius: 4px;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
	}

	.btn-primary {
		background: linear-gradient(145deg, #ffd700, #ffed4e);
		color: #000;
		font-weight: bold;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
	}

	.btn-secondary {
		background: rgba(139, 69, 19, 0.8);
		color: #fff;
		border: 2px solid #8b4513;
	}

	.btn-secondary:hover {
		background: rgba(139, 69, 19, 1);
		transform: translateY(-2px);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@media (max-width: 768px) {
		.summary-grid {
			grid-template-columns: 1fr;
		}

		.hero h2 {
			font-size: 2rem;
		}

		.action-buttons {
			flex-direction: column;
		}

		.video-option {
			flex-direction: column;
		}

		.video-option img {
			width: 100%;
			height: 120px;
		}
	}
</style> 