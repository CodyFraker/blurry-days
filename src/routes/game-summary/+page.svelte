<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { YoutubeVideo as YouTubeVideo } from '$lib/db/schema';
	import { CategoryEnum, DrinkEnum } from '$lib/db/schema';
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
	let ruleIndex = [2]; // Default to Land Camera (8 rules)
	$: selectedFormat = filmFormats[ruleIndex[0]];

	// Custom rule form
	let customRuleText = '';
	let customRuleCategory = CategoryEnum.General;
	let customRuleDrink = DrinkEnum.Sip;

	$: if (gameSettings) {
		gameSettings.intoxicationLevel = isoIndex + 1;
		gameSettings.numberOfRules = selectedFormat.value;
	}

	function handleRuleCommit(v: number) {
		const currentVal = v;
		const closest = filmFormats.reduce((prev, curr) => {
			return Math.abs(curr.value - currentVal) < Math.abs(prev.value - currentVal)
				? curr
				: prev;
		});
		ruleIndex = [filmFormats.findIndex((f) => f.value === closest.value)];
	}

	onMount(async () => {
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
		}
	});

	function loadGameSettings() {
		const params = new URLSearchParams(window.location.search);
		const videoId = params.get('videoId');
		const intoxicationLevel = parseInt(params.get('intoxicationLevel') || '2');
		const initialRuleIndex = parseInt(params.get('ruleIndex') || '2');

		if (!videoId) {
			error = 'No video selected';
			return;
		}

		const video = videos.find((v) => v.id === videoId);
		if (!video) {
			error = 'Video not found';
			return;
		}

		ruleIndex = [initialRuleIndex];

		gameSettings = {
			videoId: video.id,
			videoTitle: video.title,
			videoThumbnail: video.thumbnail,
			intoxicationLevel,
			numberOfRules: filmFormats[ruleIndex[0]].value
		};

		isoIndex = intoxicationLevel - 1;
	}

	function selectVideo(video: YouTubeVideo) {
		if (gameSettings) {
			gameSettings.videoId = video.id;
			gameSettings.videoTitle = video.title;
			gameSettings.videoThumbnail = video.thumbnail;
		}
		showVideoSelectionModal = false;
	}

	function handleDialChange(e: Event) {
		isoIndex = +(e.target as HTMLInputElement).value;
		if (isoIndex === 5) {
			const randomIdx = Math.floor(Math.random() * 5);
			selectedISO = isoValues[randomIdx] as number;
		} else {
			selectedISO = isoValues[isoIndex] as number;
		}
	}

	async function generateRules() {
		if (!gameSettings) return;

		isGeneratingRules = true;
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
				throw new Error('Failed to generate rules');
			}

			const generatedRules = await response.json();
			rules = generatedRules.rules.map((rule: any, index: number) => ({
				...rule,
				id: `generated-${Date.now()}-${index}`,
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

	async function addCustomRule() {
		if (!customRuleText.trim()) return;

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

	function updateRuleDrink(ruleId: string, newDrink: number) {
		rules = rules.map(rule => 
			rule.id === ruleId ? { ...rule, baseDrink: newDrink } : rule
		);
	}

	async function generateGame() {
		if (!gameSettings) return;

		isGenerating = true;
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
					intoxicationLevel: gameSettings.intoxicationLevel,
					numberOfRules: gameSettings.numberOfRules,
					customRules: rules.filter(rule => rule.isCustom)
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
			isGenerating = false;
		}
	}

	function goBack() {
		const params = new URLSearchParams();
		if (gameSettings) {
			params.set('videoId', gameSettings.videoId);
			params.set('intoxicationLevel', gameSettings.intoxicationLevel.toString());
			params.set('ruleIndex', ruleIndex[0].toString());
		}
		goto(`/?${params.toString()}`);
	}

	function getDrinkName(drink: number): string {
		const drinks = ['Sip', 'Gulp', 'Pull', 'Shot'];
		return drinks[drink] || 'Sip';
	}

	function getCategoryLabel(category: string): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}
</script>

<div class="game-settings">
	<div class="header">
		<h1>🎯 Game Settings</h1>
		<p>Configure your drinking game before generation</p>
	</div>

	{#if error}
		<div class="error-message">
			<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
			</svg>
			{error}
		</div>
	{/if}

	{#if gameSettings}
		<div class="settings-grid">
			<!-- Video Selection - Compact -->
			<div class="setting-card video-card">
				<div class="video-display">
					<img src={gameSettings.videoThumbnail} alt={gameSettings.videoTitle} />
					<div class="video-info">
						<h3>{gameSettings.videoTitle}</h3>
						<span class="video-status">Selected</span>
					</div>
				</div>
				<button class="change-video-btn" on:click={() => showVideoSelectionModal = true}>
					Change Video
				</button>
			</div>

			<!-- Intoxication Level -->
			<div class="setting-card">
				<h3>🍻 Intoxication Level</h3>
				<div class="iso-dial">
					<svg class="dial-svg" height="120" viewBox="0 0 200 200" width="120">
						<defs>
							<radialGradient id="metal" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stop-color="#e5e7eb" />
								<stop offset="100%" stop-color="#d1d5db" />
							</radialGradient>
						</defs>
						<circle cx="100" cy="100" r="98" fill="url(#metal)" stroke="#9ca3af" stroke-width="2" />
						<g class="knurl">
							{#each Array(40) as _, i}
								<rect
									x="98"
									y="2"
									width="4"
									height="16"
									rx="2"
									fill="#9ca3af"
									stroke="#6b7280"
									stroke-width="0.5"
									transform="rotate({i * 9} 100 100)"
								/>
							{/each}
						</g>
						<circle cx="100" cy="100" r="80" fill="#f9fafb" stroke="#d1d5db" stroke-width="2" />
						<polygon
							points="100,18 108,38 92,38"
							fill="#3b82f6"
							stroke="#1e40af"
							stroke-width="2"
						/>
						<text class="dial-number" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#374151">
							<textPath startOffset="0%" xlink:href="#arc1">100</textPath>
						</text>
						<text class="dial-number" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#374151">
							<textPath startOffset="0%" xlink:href="#arc2">200</textPath>
						</text>
						<text class="dial-number" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#374151">
							<textPath startOffset="0%" xlink:href="#arc3">400</textPath>
						</text>
						<text class="dial-number" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#374151">
							<textPath startOffset="0%" xlink:href="#arc4">800</textPath>
						</text>
						<text class="dial-number" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#374151">
							<textPath startOffset="0%" xlink:href="#arc5">1600</textPath>
						</text>
						<text class="dial-program" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#10b981">
							<textPath startOffset="0%" xlink:href="#arc6">PROGRAM</textPath>
						</text>
						<path id="arc1" d="M 100 30 A 70 70 0 0 1 170 100" fill="none" />
						<path id="arc2" d="M 170 100 A 70 70 0 0 1 100 170" fill="none" />
						<path id="arc3" d="M 100 170 A 70 70 0 0 1 30 100" fill="none" />
						<path id="arc4" d="M 30 100 A 70 70 0 0 1 100 30" fill="none" />
						<path id="arc5" d="M 100 30 A 70 70 0 0 1 135 45" fill="none" />
						<path id="arc6" d="M 135 45 A 70 70 0 0 1 100 30" fill="none" />
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
					<div class="dial-center">
						<span class="current-value">{selectedISO}</span>
					</div>
				</div>
			</div>

			<!-- Number of Rules -->
			<div class="setting-card">
				<h3>📜 Film Format</h3>
				<div class="format-buttons">
					{#each filmFormats as format, i}
						<button
							class="format-button {ruleIndex[0] === i ? 'selected' : ''}"
							on:click={() => (ruleIndex = [i])}
						>
							{format.label}
							<span class="rule-count">({format.value})</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Custom Rules -->
			<div class="setting-card rules-card">
				<div class="rules-header">
					<h3>🎲 Custom Rules</h3>
					<div class="rules-actions">
						<button class="generate-rules-btn" on:click={generateRules} disabled={isGeneratingRules}>
							{#if isGeneratingRules}
								<span class="loading"></span>
								<span>Generating...</span>
							{:else}
								<span>🎲</span>
								<span>Generate Rules</span>
							{/if}
						</button>
						<button class="add-rule-btn" on:click={() => showCustomRuleModal = true}>
							<span>+</span>
							<span>Add Rule</span>
						</button>
					</div>
				</div>
				
				{#if rules.length > 0}
					<div class="rules-table-container">
						<table class="rules-table">
							<thead>
								<tr>
									<th>Rule</th>
									<th>Category</th>
									<th>Drink</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each rules as rule (rule.id)}
									<tr class="rule-row">
										<td class="rule-text-cell">
											<span class="rule-text">{rule.text}</span>
											{#if rule.isCustom}
												<span class="custom-badge">Custom</span>
											{/if}
										</td>
										<td class="rule-category-cell">
											<span class="rule-category">{getCategoryLabel(rule.category)}</span>
										</td>
										<td class="rule-drink-cell">
											<select 
												class="drink-select"
												value={rule.baseDrink}
												on:change={(e) => updateRuleDrink(rule.id, parseInt((e.target as HTMLSelectElement).value))}
											>
												{#each Object.values(DrinkEnum) as drink}
													<option value={drink}>{getDrinkName(drink)}</option>
												{/each}
											</select>
										</td>
										<td class="rule-actions-cell">
											<button class="delete-rule-btn" on:click={() => deleteRule(rule.id)}>
												×
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="empty-rules">
						<p>No rules added yet</p>
						<div class="empty-actions">
							<button class="generate-first-rules-btn" on:click={generateRules} disabled={isGeneratingRules}>
								{#if isGeneratingRules}
									<span class="loading"></span>
									<span>Generating...</span>
								{:else}
									<span>🎲</span>
									<span>Generate Rules</span>
								{/if}
							</button>
							<button class="add-first-rule-btn" on:click={() => showCustomRuleModal = true}>
								Add your first rule
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons">
			<button class="btn btn-secondary" on:click={goBack}>
				<span>⬅️</span>
				<span>Back</span>
			</button>
			<button class="btn btn-primary" on:click={generateGame} disabled={isGenerating}>
				{#if isGenerating}
					<span class="loading"></span>
					<span>Generating...</span>
				{:else}
					<span>🚀</span>
					<span>Generate Game</span>
				{/if}
			</button>
		</div>
	{:else}
		<div class="loading-state">
			<div class="loading"></div>
			<p>Loading settings...</p>
		</div>
	{/if}
</div>

<!-- Video Selection Modal -->
<Dialog.Root bind:open={showVideoSelectionModal}>
	<Dialog.Content class="modal video-selection-modal">
		<div class="modal-header">
			<h2>Select a Video</h2>
			<button class="close-btn" on:click={() => showVideoSelectionModal = false}>×</button>
		</div>
		
		<div class="modal-content">
			<div class="videos-grid">
				{#each videos.slice(0, 12) as video (video.id)}
					<div class="video-option {gameSettings?.videoId === video.id ? 'selected' : ''}" on:click={() => selectVideo(video)}>
						<img src={video.thumbnail} alt={video.title} />
						<div class="video-option-info">
							<h4>{video.title}</h4>
							{#if gameSettings?.videoId === video.id}
								<span class="current-indicator">Currently Selected</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<div class="modal-footer">
			<button class="btn btn-secondary" on:click={() => showVideoSelectionModal = false}>
				Cancel
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Custom Rule Modal -->
<Dialog.Root bind:open={showCustomRuleModal}>
	<Dialog.Content class="modal">
		<div class="modal-header">
			<h2>Add Custom Rule</h2>
			<button class="close-btn" on:click={() => showCustomRuleModal = false}>×</button>
		</div>
		
		<div class="modal-content">
			<div class="form-group">
				<label for="rule-text">Rule Text</label>
				<textarea
					id="rule-text"
					bind:value={customRuleText}
					placeholder="Enter your custom drinking rule..."
					rows="3"
				></textarea>
			</div>
			
			<div class="form-row">
				<div class="form-group">
					<label for="rule-category">Category</label>
					<select id="rule-category" bind:value={customRuleCategory}>
						{#each Object.values(CategoryEnum) as category}
							<option value={category}>{getCategoryLabel(category)}</option>
						{/each}
					</select>
				</div>
				
				<div class="form-group">
					<label for="rule-drink">Drink Amount</label>
					<select id="rule-drink" bind:value={customRuleDrink}>
						{#each Object.values(DrinkEnum) as drink}
							<option value={drink}>{getDrinkName(drink)}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		
		<div class="modal-footer">
			<button class="btn btn-secondary" on:click={() => showCustomRuleModal = false}>
				Cancel
			</button>
			<button class="btn btn-primary" on:click={addCustomRule} disabled={isAddingRule || !customRuleText.trim()}>
				{#if isAddingRule}
					<span class="loading"></span>
					Adding...
				{:else}
					Add Rule
				{/if}
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	.game-settings {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
		padding: 1.5rem 0;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.025em;
	}

	.header p {
		font-size: 1rem;
		color: #6b7280;
		margin: 0;
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

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.setting-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.setting-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	/* Video Card */
	.video-card {
		grid-column: 1 / -1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.video-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.video-display img {
		width: 80px;
		height: 60px;
		object-fit: cover;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.video-info h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
	}

	.video-status {
		font-size: 0.8rem;
		color: #10b981;
		background: #d1fae5;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 500;
	}

	.change-video-btn {
		background: #3b82f6;
		color: #ffffff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.change-video-btn:hover {
		background: #2563eb;
	}

	/* ISO Dial */
	.iso-dial {
		position: relative;
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.dial-svg {
		display: block;
	}

	.dial-input {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 96px;
		height: 96px;
		opacity: 0;
		cursor: pointer;
	}

	.dial-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #ffffff;
		border: 2px solid #e5e7eb;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #1f2937;
		font-size: 0.75rem;
	}

	/* Format Buttons */
	.format-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.format-button {
		background: #f9fafb;
		color: #374151;
		border: 1px solid #e5e7eb;
		padding: 0.75rem 0.5rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.format-button:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.format-button.selected {
		background: #3b82f6;
		color: #ffffff;
		border-color: #3b82f6;
	}

	.rule-count {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	/* Rules Card */
	.rules-card {
		grid-column: 1 / -1;
	}

	.rules-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.rules-actions {
		display: flex;
		gap: 0.75rem;
	}

	.generate-rules-btn {
		background: #3b82f6;
		color: #ffffff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.generate-rules-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.generate-rules-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.add-rule-btn {
		background: #10b981;
		color: #ffffff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.generate-rules-btn:hover,
	.add-rule-btn:hover {
		background: #059669;
	}

	.rules-table-container {
		overflow-x: auto;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.rules-table {
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0;
		font-size: 0.875rem;
		color: #374151;
	}

	.rules-table th,
	.rules-table td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	.rules-table th {
		font-weight: 600;
		color: #1f2937;
		background: #f9fafb;
	}

	.rules-table tbody tr:last-child td {
		border-bottom: none;
	}

	.rule-row {
		transition: background-color 0.2s ease;
	}

	.rule-row:hover {
		background: #f3f4f6;
	}

	.rule-text-cell {
		position: relative;
		max-width: 300px;
	}

	.rule-text {
		font-size: 0.875rem;
		color: #1f2937;
		font-weight: 500;
		line-height: 1.4;
		display: block;
	}

	.custom-badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background: #ef4444;
		color: #ffffff;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.rule-category-cell {
		width: 150px;
	}

	.rule-category {
		font-size: 0.75rem;
		color: #6b7280;
		background: #e5e7eb;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
	}

	.rule-drink-cell {
		width: 100px;
	}

	.drink-select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #ffffff;
		cursor: pointer;
	}

	.drink-select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.rule-actions-cell {
		width: 50px;
		text-align: center;
	}

	.delete-rule-btn {
		background: #ef4444;
		color: #ffffff;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.delete-rule-btn:hover {
		background: #dc2626;
	}

	.empty-rules {
		text-align: center;
		padding: 2rem 0;
		color: #6b7280;
	}

	.empty-rules p {
		margin: 0 0 1rem 0;
		font-size: 0.875rem;
	}

	.empty-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.generate-first-rules-btn {
		background: #3b82f6;
		color: #ffffff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.generate-first-rules-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.generate-first-rules-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.add-first-rule-btn {
		background: #10b981;
		color: #ffffff;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.generate-first-rules-btn:hover,
	.add-first-rule-btn:hover {
		background: #059669;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.btn-primary {
		background: #3b82f6;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem 0;
		color: #6b7280;
	}

	/* Modal Styles */
	.modal {
		background: #ffffff;
		border-radius: 12px;
		padding: 1.5rem;
		max-width: 500px;
		width: 90vw;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.video-selection-modal {
		max-width: 800px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6b7280;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.modal-content {
		margin: 1rem 0;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	/* Video Selection Grid */
	.videos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}

	.video-option {
		background: #f9fafb;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.video-option:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.video-option.selected {
		background: #dbeafe;
		border-color: #3b82f6;
	}

	.video-option img {
		width: 100%;
		height: 100px;
		object-fit: cover;
		border-radius: 6px;
		margin-bottom: 0.5rem;
	}

	.video-option-info h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.current-indicator {
		font-size: 0.75rem;
		color: #3b82f6;
		font-weight: 500;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #ffffff;
	}

	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.header h1 {
			font-size: 1.75rem;
		}

		.settings-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.video-card {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.video-display {
			flex-direction: column;
			text-align: center;
		}

		.video-display img {
			width: 100%;
			max-width: 200px;
			height: auto;
		}

		.change-video-btn {
			width: 100%;
		}

		.format-buttons {
			grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		}

		.rules-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.rules-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		.generate-rules-btn,
		.add-rule-btn {
			width: 100%;
		}

		.action-buttons {
			flex-direction: column;
		}

		.action-buttons .btn {
			width: 100%;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.videos-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}
	}

	@media (max-width: 480px) {
		.game-settings {
			padding: 0 0.5rem;
		}

		.header {
			padding: 1rem 0;
			margin-bottom: 1.5rem;
		}

		.header h1 {
			font-size: 1.5rem;
		}

		.setting-card {
			padding: 1rem;
		}

		.rules-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.rules-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		.generate-rules-btn,
		.add-rule-btn {
			justify-content: center;
		}

		.rules-table {
			font-size: 0.75rem;
		}

		.rules-table th,
		.rules-table td {
			padding: 0.5rem 0.75rem;
		}

		.rule-text-cell {
			padding-right: 0;
		}

		.rule-category-cell {
			width: 100px;
		}

		.rule-drink-cell {
			width: 80px;
		}

		.rule-actions-cell {
			width: 40px;
		}

		.delete-rule-btn {
			font-size: 0.875rem;
		}

		.empty-rules {
			padding: 1.5rem 0;
		}

		.empty-actions {
			flex-direction: column;
			gap: 0.75rem;
		}

		.generate-first-rules-btn,
		.add-first-rule-btn {
			width: 100%;
		}

		.videos-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.header h1 {
			color: #f9fafb;
		}

		.header p {
			color: #9ca3af;
		}

		.setting-card {
			background: #1f2937;
			border-color: #374151;
		}

		.setting-card h3 {
			color: #f9fafb;
		}

		.video-info h3 {
			color: #f9fafb;
		}

		.rule-row {
			background: #374151;
			border-color: #4b5563;
		}

		.rule-row:hover {
			background: #4b5563;
		}

		.rule-text {
			color: #f9fafb;
		}

		.custom-badge {
			background: #ef4444;
			color: #ffffff;
		}

		.format-button {
			background: #374151;
			color: #d1d5db;
			border-color: #4b5563;
		}

		.format-button:hover {
			background: #4b5563;
			border-color: #6b7280;
		}

		.dial-center {
			background: #1f2937;
			border-color: #374151;
			color: #f9fafb;
		}

		.modal {
			background: #1f2937;
			border-color: #374151;
		}

		.modal-header h2 {
			color: #f9fafb;
		}

		.modal-header {
			border-bottom-color: #374151;
		}

		.modal-footer {
			border-top-color: #374151;
		}

		.video-option {
			background: #374151;
			border-color: #4b5563;
		}

		.video-option:hover {
			background: #4b5563;
			border-color: #6b7280;
		}

		.video-option.selected {
			background: #1e3a8a;
			border-color: #3b82f6;
		}

		.video-option-info h4 {
			color: #f9fafb;
		}

		.form-group label {
			color: #f9fafb;
		}

		.form-group textarea,
		.form-group select {
			background: #374151;
			border-color: #4b5563;
			color: #f9fafb;
		}

		.error-message {
			background: #450a0a;
			border-color: #7f1d1d;
			color: #fca5a5;
		}
	}
</style> 