<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { YoutubeVideo as YouTubeVideo } from '$lib/db/schema';
	import { CategoryEnum, DrinkEnum } from '$lib/db/schema';
	import { getDrinkName } from '$lib/rules/ruleEngine';
	import { Dialog } from 'bits-ui';

	interface GameSettings {
		videoId: string;
		videoTitle: string;
		videoThumbnail: string | null;
		intoxicationLevel: number;
		numberOfRules: number;
	}

	interface Rule {
		id: string;
		text: string;
		category: string;
		baseDrink: number;
		order: number;
		isCustom?: boolean;
	}

	let gameSettings: GameSettings | null = null;
	let videos: YouTubeVideo[] = [];
	let rules: Rule[] = [];
	let isLoading = false;
	let error = '';
	let isGenerating = false;
	let showCustomRuleModal = false;
	let isAddingRule = false;
	let showVideoSelectionModal = false;
	let isGeneratingRules = false;
	let isRerolling = false;
	let rerollingRules = new Set<string>();

	// Custom rule form
	let customRuleText = '';
	let customRuleCategory = CategoryEnum.General;
	let customRuleDrink = DrinkEnum.Sip;

	// Intoxication Level State
	const isoValues: (number | 'PROGRAM')[] = [100, 200, 400, 800, 1600, 'PROGRAM'];
	let isoIndex = 0;
	$: selectedISO = isoValues[isoIndex] as number | 'PROGRAM';

	// Number of Rules State
	const filmFormats = [
		{ label: 'Panoramic', value: 3 },
		{ label: 'Box Camera', value: 6 },
		{ label: 'Land Camera', value: 8 },
		{ label: 'Square Format', value: 12 },
		{ label: 'Medium Format', value: 18 },
		{ label: '35mm', value: 36 }
	];
	let selectedFormatIndex = 3; // Default to Square Format (12 rules)
	$: selectedFormat = filmFormats[selectedFormatIndex];

	$: if (gameSettings) {
		gameSettings.intoxicationLevel = isoIndex + 1;
		gameSettings.numberOfRules = selectedFormat.value;
	}



	onMount(async () => {
		isLoading = true;
		try {
			const response = await fetch('/api/videos');
			if (!response.ok) {
				throw new Error('Failed to fetch videos from API');
			}
			videos = await response.json();
			loadGameSettings();
		} catch (err) {
			error = 'Failed to load data';
			console.error(err);
		} finally {
			isLoading = false;
		}
	});

	function loadGameSettings() {
		const params = new URLSearchParams(window.location.search);
		const videoId = params.get('videoId');

		if (!videoId) {
			goto('/');
			return;
		}

		const video = videos.find((v) => v.id === videoId);
		if (!video) {
			error = 'Video not found';
			return;
		}

		gameSettings = {
			videoId: video.id,
			videoTitle: video.title,
			videoThumbnail: video.thumbnail,
			intoxicationLevel: isoIndex + 1,
			numberOfRules: selectedFormat.value
		};
	}

	function selectVideo(video: YouTubeVideo) {
		if (gameSettings) {
			gameSettings.videoId = video.id;
			gameSettings.videoTitle = video.title;
			gameSettings.videoThumbnail = video.thumbnail;
		}
		showVideoSelectionModal = false;
	}

	async function generateRules() {
		if (!gameSettings) return;

		isGeneratingRules = true;
		try {
			// Generate rules without creating a game yet
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules: gameSettings.numberOfRules,
					intoxicationLevel: gameSettings.intoxicationLevel
				})
			});

			if (!response.ok) {
				throw new Error('Failed to generate rules');
			}

			const data = await response.json();
			rules = data.rules.map((rule: any, index: number) => ({
				...rule,
				id: `temp-${Date.now()}-${index}`,
				order: index + 1,
				isCustom: false
			}));
		} catch (err) {
			error = 'Failed to generate rules';
			console.error(err);
		} finally {
			isGeneratingRules = false;
		}
	}

	async function rerollRules() {
		if (!gameSettings) return;

		isRerolling = true;
		try {
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules: gameSettings.numberOfRules,
					intoxicationLevel: gameSettings.intoxicationLevel
				})
			});

			if (!response.ok) {
				throw new Error('Failed to re-roll rules');
			}

			const data = await response.json();
			rules = data.rules.map((rule: any, index: number) => ({
				...rule,
				id: `temp-${Date.now()}-${index}`,
				order: index + 1,
				isCustom: false
			}));
		} catch (err) {
			error = 'Failed to re-roll rules';
			console.error(err);
		} finally {
			isRerolling = false;
		}
	}

	async function rerollSingleRule(ruleIndex: number) {
		if (!gameSettings) return;

		const ruleId = rules[ruleIndex].id;
		rerollingRules.add(ruleId);
		
		try {
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules: 1,
					intoxicationLevel: gameSettings.intoxicationLevel
				})
			});

			if (!response.ok) {
				throw new Error('Failed to re-roll rule');
			}

			const data = await response.json();
			const newRule = {
				...data.rules[0],
				id: `temp-${Date.now()}-${ruleIndex}`,
				order: ruleIndex + 1,
				isCustom: false
			};

			rules = rules.map((rule, index) => (index === ruleIndex ? newRule : rule));
		} catch (err) {
			error = 'Failed to re-roll rule';
			console.error(err);
		} finally {
			rerollingRules.delete(ruleId);
		}
	}

	async function addCustomRule() {
		if (!gameSettings || !customRuleText.trim()) return;

		isAddingRule = true;
		try {
			const newRule: Rule = {
				id: `custom-${Date.now()}`,
				text: customRuleText.trim(),
				category: customRuleCategory,
				baseDrink: customRuleDrink,
				order: rules.length + 1,
				isCustom: true
			};

			rules = [...rules, newRule];

			// Reset form
			customRuleText = '';
			customRuleCategory = CategoryEnum.General;
			customRuleDrink = DrinkEnum.Sip;
			showCustomRuleModal = false;
		} catch (err) {
			error = 'Failed to add custom rule';
			console.error(err);
		} finally {
			isAddingRule = false;
		}
	}

	function deleteRule(ruleId: string) {
		rules = rules.filter(rule => rule.id !== ruleId);
		// Reorder remaining rules
		rules = rules.map((rule, index) => ({ ...rule, order: index + 1 }));
	}

	async function generateGame() {
		if (!gameSettings || rules.length === 0) return;

		isGenerating = true;
		try {
			const response = await fetch('/api/games', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: `${gameSettings.videoTitle} Drinking Game`,
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					videoThumbnail: gameSettings.videoThumbnail,
					intoxicationLevel: gameSettings.intoxicationLevel,
					rules: rules.map(rule => ({
						text: rule.text,
						category: rule.category,
						baseDrink: rule.baseDrink,
						isCustom: rule.isCustom || false
					}))
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create game');
			}

			const data = await response.json();
			goto(`/game/${data.game.id}`);
		} catch (err) {
			error = 'Failed to generate game';
			console.error(err);
		} finally {
			isGenerating = false;
		}
	}

	function getCategoryLabel(category: string): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	function closeModal() {
		showCustomRuleModal = false;
		customRuleText = '';
		customRuleCategory = CategoryEnum.General;
		customRuleDrink = DrinkEnum.Sip;
	}
</script>

{#if isLoading}
	<div class="loading-state">
		<div class="loading"></div>
		<p>Loading game setup...</p>
	</div>
{:else if error}
	<div class="error-container">
		<div class="error-message">
			<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
			</svg>
			<div>
				<h2>Error</h2>
				<p>{error}</p>
			</div>
		</div>
		<a href="/" class="btn btn-primary">Go Home</a>
	</div>
{:else if gameSettings}
	<div class="game-summary-page">
		<div class="page-header">
			<h1 class="page-title">🎬 Create Your Drinking Game</h1>
			<p class="page-subtitle">Customize your settings and rules before generating your game</p>
		</div>

		<div class="game-setup">
			<div class="video-selection">
				<h2 class="section-title">Selected Video</h2>
				<div class="selected-video">
					<img src={gameSettings.videoThumbnail} alt={gameSettings.videoTitle} class="video-thumbnail" />
					<div class="video-info">
						<h3 class="video-title">{gameSettings.videoTitle}</h3>
						<button class="btn btn-secondary" on:click={() => showVideoSelectionModal = true}>
							Change Video
						</button>
					</div>
				</div>
			</div>

			<div class="settings-grid">
				<div class="setting-card">
					<h3 class="setting-title">🍻 Intoxication Level</h3>
					<div class="iso-dial">
						<div class="iso-values">
							{#each isoValues as value, index}
								<button
									class="iso-value"
									class:active={index === isoIndex}
									on:click={() => isoIndex = index}
								>
									{value}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="setting-card">
					<h3 class="setting-title">📸 Number of Rules</h3>
					<div class="format-selector">
						{#each filmFormats as format, index}
							<button
								class="format-option"
								class:active={index === selectedFormatIndex}
								on:click={() => selectedFormatIndex = index}
							>
								<span class="format-label">{format.label}</span>
								<span class="format-value">{format.value} rules</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			{#if rules.length === 0}
				<div class="generate-section">
					<button class="btn btn-primary btn-large" on:click={generateRules} disabled={isGeneratingRules}>
						{#if isGeneratingRules}
							<span class="loading"></span>
							<span>Generating Rules...</span>
						{:else}
							<span>🎲</span>
							<span>Generate Rules</span>
						{/if}
					</button>
				</div>
			{:else}
				<div class="rules-section">
					<div class="rules-header">
						<h2 class="section-title">📜 Your Rules</h2>
						<div class="rules-actions">
							<button class="btn btn-primary" on:click={rerollRules} disabled={isRerolling}>
								{#if isRerolling}
									<span class="loading"></span>
									<span>Rerolling...</span>
								{:else}
									<span>🎲</span>
									<span>Reroll All</span>
								{/if}
							</button>

							<Dialog.Root bind:open={showCustomRuleModal}>
								<Dialog.Trigger>
									<button class="btn btn-success">
										<span>✨</span>
										<span>Add Custom Rule</span>
									</button>
								</Dialog.Trigger>
								<Dialog.Portal>
									<Dialog.Overlay class="modal-overlay" />
									<Dialog.Content class="modal-content">
										<Dialog.Title class="modal-title">✨ Add a Custom Rule</Dialog.Title>
										<form on:submit|preventDefault={addCustomRule}>
											<div class="form-group">
												<label for="custom-rule-text" class="form-label">Rule Description</label>
												<textarea
													id="custom-rule-text"
													bind:value={customRuleText}
													placeholder="e.g., Every time someone laughs, take a sip."
													rows="3"
													required
													class="form-input"
												></textarea>
											</div>
											<div class="form-row">
												<div class="form-group">
													<label for="custom-rule-category" class="form-label">Category</label>
													<select id="custom-rule-category" bind:value={customRuleCategory} class="form-input">
														{#each Object.values(CategoryEnum) as category}
															<option value={category}>{getCategoryLabel(category)}</option>
														{/each}
													</select>
												</div>
												<div class="form-group">
													<label for="custom-rule-drink" class="form-label">Drink</label>
													<select id="custom-rule-drink" bind:value={customRuleDrink} class="form-input">
														{#each Object.entries(DrinkEnum) as [key, value]}
															{#if !isNaN(Number(key))}
																<option value={key}>{getDrinkName(Number(key)).name}</option>
															{/if}
														{/each}
													</select>
												</div>
											</div>
											<div class="modal-actions">
												<Dialog.Close>
													<button type="button" class="btn btn-secondary">Cancel</button>
												</Dialog.Close>
												<button type="submit" class="btn btn-success" disabled={isAddingRule}>
													{#if isAddingRule}
														<span class="loading"></span>
														<span>Adding...</span>
													{:else}
														<span>Add Rule</span>
													{/if}
												</button>
											</div>
										</form>
									</Dialog.Content>
								</Dialog.Portal>
							</Dialog.Root>
						</div>
					</div>

					<div class="rules-grid">
						{#each rules as rule, index (rule.id)}
							<div class="rule-card" class:custom-rule={rule.isCustom}>
								{#if rule.isCustom}
									<div class="custom-badge">Custom</div>
								{/if}
								<div class="rule-header">
									<div class="rule-number">{index + 1}</div>
									<div class="drink-info">
										<span class="drink-icon">{getDrinkName(rule.baseDrink).icon}</span>
										<span class="drink-name">{getDrinkName(rule.baseDrink).name}</span>
									</div>
								</div>

								<div class="rule-content">
									<p class="rule-text">{rule.text}</p>
								</div>

								<div class="rule-footer">
									<span class="rule-category">{getCategoryLabel(rule.category)}</span>
									<div class="rule-actions">
										<button
											class="action-btn reroll-btn"
											on:click={() => rerollSingleRule(index)}
											disabled={rerollingRules.has(rule.id)}
											aria-label="Reroll rule"
										>
											{#if rerollingRules.has(rule.id)}
												<div class="loading"></div>
											{:else}
												🎲
											{/if}
										</button>
										<button
											class="action-btn delete-btn"
											on:click={() => deleteRule(rule.id)}
											aria-label="Delete rule"
										>
											🗑️
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<div class="finalize-section">
						<button class="btn btn-primary btn-large" on:click={generateGame} disabled={isGenerating}>
							{#if isGenerating}
								<span class="loading"></span>
								<span>Creating Game...</span>
							{:else}
								<span>🚀</span>
								<span>Generate Game</span>
							{/if}
						</button>
						<p class="finalize-note">This will create your shareable drinking game!</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Video Selection Modal -->
	<Dialog.Root bind:open={showVideoSelectionModal}>
		<Dialog.Portal>
			<Dialog.Overlay class="modal-overlay" />
			<Dialog.Content class="modal-content video-selection-modal">
				<Dialog.Title class="modal-title">🎬 Choose a Different Video</Dialog.Title>
				<div class="videos-grid">
					{#each videos.slice(0, 12) as video (video.id)}
						<div class="video-option {gameSettings?.videoId === video.id ? 'selected' : ''}" on:click={() => selectVideo(video)}>
							<img src={video.thumbnail} alt={video.title} />
							<div class="video-option-info">
								<h4>{video.title}</h4>
							</div>
						</div>
					{/each}
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
{/if}

<style>
	/* Base styles */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 4rem 2rem;
		color: #6b7280;
	}

	.error-container {
		text-align: center;
		padding: 4rem 2rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #991b1b;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		text-align: left;
	}

	.error-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.game-summary-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.025em;
	}

	.page-subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		margin: 0;
	}

	.game-setup {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.video-selection {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.selected-video {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.video-thumbnail {
		width: 160px;
		height: 120px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.video-info {
		flex: 1;
	}

	.video-title {
		font-size: 1.125rem;
		font-weight: 500;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.setting-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
	}

	.setting-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.iso-dial {
		display: flex;
		justify-content: center;
	}

	.iso-values {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.iso-value {
		background: #f3f4f6;
		border: 2px solid #e5e7eb;
		color: #374151;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		min-width: 60px;
	}

	.iso-value:hover {
		background: #e5e7eb;
		border-color: #d1d5db;
	}

	.iso-value.active {
		background: #3b82f6;
		border-color: #3b82f6;
		color: #ffffff;
	}

	.format-selector {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.format-option {
		background: #f3f4f6;
		border: 2px solid #e5e7eb;
		color: #374151;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.format-option:hover {
		background: #e5e7eb;
		border-color: #d1d5db;
	}

	.format-option.active {
		background: #3b82f6;
		border-color: #3b82f6;
		color: #ffffff;
	}

	.format-label {
		font-weight: 500;
	}

	.format-value {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.generate-section {
		text-align: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		text-decoration: none;
	}

	.btn-primary {
		background: #3b82f6;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.btn-success {
		background: #10b981;
		color: #ffffff;
	}

	.btn-success:hover:not(:disabled) {
		background: #059669;
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1.125rem;
	}

	.rules-section {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 2rem;
	}

	.rules-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.rules-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.rules-grid {
		display: grid;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.rule-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		position: relative;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.rule-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.rule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.rule-number {
		background: #3b82f6;
		color: #ffffff;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.drink-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.drink-icon {
		font-size: 1.25rem;
	}

	.drink-name {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.rule-content {
		margin-bottom: 1rem;
	}

	.rule-text {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: #1f2937;
	}

	.rule-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.rule-category {
		background: #f3f4f6;
		color: #374151;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.rule-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.action-btn {
		background: transparent;
		border: 1px solid #e5e7eb;
		color: #6b7280;
		padding: 0.5rem;
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		background: #f9fafb;
		border-color: #d1d5db;
	}

	.delete-btn:hover {
		background: #fef2f2;
		border-color: #fecaca;
		color: #dc2626;
	}

	.reroll-btn:hover:not(:disabled) {
		background: #eff6ff;
		border-color: #bfdbfe;
		color: #3b82f6;
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.custom-rule {
		border-color: #10b981;
		background: #f0fdf4;
	}

	.custom-badge {
		background: #10b981;
		color: #ffffff;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		position: absolute;
		top: 1rem;
		right: 1rem;
	}

	.finalize-section {
		text-align: center;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.finalize-note {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.5rem 0 0 0;
	}

	/* Modal styles */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 50;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #ffffff;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		width: 90%;
		max-width: 500px;
		z-index: 50;
		border: 1px solid #e5e7eb;
	}

	.video-selection-modal {
		max-width: 800px;
	}

	.modal-title {
		margin: 0 0 1.5rem 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.videos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	.video-option {
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.video-option:hover {
		border-color: #3b82f6;
		transform: scale(1.02);
	}

	.video-option.selected {
		border-color: #10b981;
		background: #f0fdf4;
	}

	.video-option img {
		width: 100%;
		height: 120px;
		object-fit: cover;
	}

	.video-option-info {
		padding: 0.75rem;
	}

	.video-option-info h4 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
		color: #1f2937;
		line-height: 1.3;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #ffffff;
	}

	.form-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
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

	/* Responsive design */
	@media (max-width: 768px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}

		.selected-video {
			flex-direction: column;
			text-align: center;
		}

		.video-thumbnail {
			width: 100%;
			max-width: 300px;
			height: auto;
		}

		.rules-header {
			flex-direction: column;
			align-items: stretch;
		}

		.rules-actions {
			justify-content: center;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.modal-actions {
			flex-direction: column;
		}

		.videos-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 480px) {
		.game-summary-page {
			padding: 0 0.5rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.setting-card,
		.video-selection,
		.rules-section {
			padding: 1.5rem;
		}

		.iso-values {
			grid-template-columns: repeat(3, 1fr);
		}

		.videos-grid {
			grid-template-columns: 1fr;
		}
	}
</style>