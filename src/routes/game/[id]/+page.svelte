<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getDrinkName } from '$lib/rules/ruleEngine';
	import { CategoryEnum, DrinkEnum } from '$lib/db/schema';
	import FilmStrip from '$lib/components/FilmStrip.svelte';

	interface Rule {
		id: string;
		text: string;
		category: string;
		baseDrink: number;
		order: number;
		isCustom?: boolean;
	}

	interface Game {
		id: string;
		title: string;
		videoTitle: string;
		videoThumbnail: string;
		intoxicationLevel: number;
		expiresAt: string;
	}

	let game: Game | null = null;
	let rules: Rule[] = [];
	let isLoading = true;
	let error = '';
	let copied = false;
	let showCustomRuleModal = false;
	let isRerolling = false;
	let isAddingRule = false;
	let rerollingRules = new Set<string>(); // Track which rules are being re-rolled

	// Custom rule form
	let customRuleText = '';
	let customRuleCategory = CategoryEnum.General;
	let customRuleDrink = DrinkEnum.Sip;

	$: gameId = $page.params.id;
	$: ruleTexts = rules.map(rule => rule.text);

	onMount(async () => {
		await loadGame();
	});

	async function loadGame() {
		try {
			const response = await fetch(`/api/games/${gameId}`);
			if (!response.ok) {
				throw new Error('Game not found');
			}

			const data = await response.json();
			game = data.game;
			rules = data.rules;
		} catch (err) {
			error = 'Failed to load game';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	async function rerollRules() {
		if (!game) return;

		isRerolling = true;
		try {
			const response = await fetch(`/api/games/${gameId}/reroll`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to re-roll rules');
			}

			const data = await response.json();
			rules = data.rules;
		} catch (err) {
			error = 'Failed to re-roll rules';
			console.error(err);
		} finally {
			isRerolling = false;
		}
	}

	async function rerollSingleRule(ruleId: string) {
		if (!game) return;

		rerollingRules.add(ruleId);
		try {
			const response = await fetch(`/api/games/${gameId}/rules/${ruleId}/reroll`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to re-roll rule');
			}

			const data = await response.json();
			
			// Update the specific rule in the rules array
			rules = rules.map(rule => 
				rule.id === ruleId ? data.rule : rule
			);
		} catch (err) {
			error = 'Failed to re-roll rule';
			console.error(err);
		} finally {
			rerollingRules.delete(ruleId);
		}
	}

	async function addCustomRule() {
		if (!game || !customRuleText.trim()) return;

		isAddingRule = true;
		try {
			const response = await fetch(`/api/games/${gameId}/rules`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: customRuleText.trim(),
					category: customRuleCategory,
					baseDrink: customRuleDrink
				})
			});

			if (!response.ok) {
				throw new Error('Failed to add custom rule');
			}

			const data = await response.json();
			rules = [...rules, data.rule];
			
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

	async function deleteRule(ruleId: string) {
		if (!game) return;

		try {
			const response = await fetch(`/api/games/${gameId}/rules`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ruleId })
			});

			if (!response.ok) {
				throw new Error('Failed to delete rule');
			}

			// Reload rules to get updated order
			await loadGame();
		} catch (err) {
			error = 'Failed to delete rule';
			console.error(err);
		}
	}

	async function copyShareLink() {
		const shareUrl = `${window.location.origin}/game/${gameId}`;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString();
	}

	function getIntoxicationLabel(level: number): string {
		const labels = ['Tipsy', 'Buzzed', 'Drunk', 'Wasted', 'Blackout'];
		return labels[level - 1] || 'Unknown';
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
	<div class="loading-container">
		<div class="loading"></div>
		<p>Loading your drinking game...</p>
	</div>
{:else if error}
	<div class="error-container">
		<h2>❌ {error}</h2>
		<p>The game you're looking for doesn't exist or has expired.</p>
		<a href="/" class="btn">Create New Game</a>
	</div>
{:else if game}
	<div class="game-page">
		<div class="game-header">
			<div class="video-info">
				<img src={game.videoThumbnail} alt={game.videoTitle} class="video-thumbnail" />
				<div class="video-details">
					<h1>{game.title}</h1>
					<p class="video-title">{game.videoTitle}</p>
					<div class="game-meta">
						<span class="intoxication-level">
							🍻 Intoxication Level: {getIntoxicationLabel(game.intoxicationLevel)}
						</span>
						<span class="expires-at">
							⏰ Expires: {formatDate(game.expiresAt)}
						</span>
					</div>
				</div>
			</div>
			
			<div class="share-section">
				<button class="btn share-btn" on:click={copyShareLink}>
					{copied ? '✅ Copied!' : '📋 Share Game'}
				</button>
				<p class="share-note">Share this link with your friends to play together!</p>
			</div>
		</div>

		<div class="rules-section">
			<div class="rules-header">
				<h2>🎯 Drinking Rules</h2>
				<div class="rules-actions">
					<button 
						class="btn btn-secondary" 
						on:click={rerollRules}
						disabled={isRerolling}
					>
						{#if isRerolling}
							<span class="loading"></span>
							Re-rolling...
						{:else}
							🎲 Re-roll Rules
						{/if}
					</button>
					<button 
						class="btn btn-primary" 
						on:click={() => showCustomRuleModal = true}
					>
						➕ Add Custom Rule
					</button>
				</div>
			</div>
			<p class="rules-intro">Follow these rules while watching the video:</p>
			
			<FilmStrip
				rules={ruleTexts}
				onReroll={idx => rerollSingleRule(rules[idx].id)}
			/>
		</div>

		<div class="game-footer">
			<div class="card">
				<h3>🎮 How to Play</h3>
				<ol>
					<li>Gather your friends and drinks</li>
					<li>Start the Grainydays video</li>
					<li>Follow the rules above when they occur</li>
					<li>Drink responsibly and have fun!</li>
				</ol>
			</div>
		</div>
	</div>
{/if}

<!-- Custom Rule Modal -->
{#if showCustomRuleModal}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3>➕ Add Custom Rule</h3>
				<button class="modal-close" on:click={closeModal} aria-label="Close modal">×</button>
			</div>
			
			<form class="custom-rule-form" on:submit|preventDefault={addCustomRule}>
				<div class="form-group">
					<label for="rule-text">Rule Text</label>
					<textarea 
						id="rule-text"
						bind:value={customRuleText}
						placeholder="e.g., Every time the host mentions film grain..."
						required
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
						<label for="rule-drink">Drink Level</label>
						<select id="rule-drink" bind:value={customRuleDrink}>
							<option value={DrinkEnum.Sip}>Sip</option>
							<option value={DrinkEnum.Gulp}>Gulp</option>
							<option value={DrinkEnum.Pull}>Pull</option>
							<option value={DrinkEnum.Shot}>Shot</option>
						</select>
					</div>
				</div>
				
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" on:click={closeModal}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isAddingRule || !customRuleText.trim()}>
						{#if isAddingRule}
							<span class="loading"></span>
							Adding...
						{:else}
							Add Rule
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.loading-container,
	.error-container {
		text-align: center;
		padding: 4rem 2rem;
	}

	.loading-container .loading {
		margin: 0 auto 1rem;
	}

	.error-container h2 {
		color: #ff6b6b;
		margin-bottom: 1rem;
	}

	.game-page {
		max-width: 1000px;
		margin: 0 auto;
	}

	.game-header {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		margin-bottom: 3rem;
		align-items: start;
	}

	.video-info {
		display: flex;
		gap: 1.5rem;
		align-items: start;
	}

	.video-thumbnail {
		width: 200px;
		height: 150px;
		object-fit: cover;
		border-radius: 8px;
		border: 2px solid #8b4513;
	}

	.video-details h1 {
		margin: 0 0 0.5rem 0;
		color: #ffd700;
		font-size: 2rem;
	}

	.video-title {
		margin: 0 0 1rem 0;
		color: #ccc;
		font-size: 1.1rem;
	}

	.game-meta {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.intoxication-level,
	.expires-at {
		background: rgba(139, 69, 19, 0.3);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.9rem;
		color: #f5f5f5;
	}

	.share-section {
		text-align: center;
	}

	.share-btn {
		margin-bottom: 0.5rem;
	}

	.share-note {
		font-size: 0.9rem;
		color: #999;
		margin: 0;
	}

	.rules-section {
		margin-bottom: 3rem;
	}

	.rules-section h2 {
		color: #ffd700;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.rules-intro {
		text-align: center;
		color: #ccc;
		margin-bottom: 2rem;
	}

	.rules-grid {
		display: grid;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.rule-card {
		background: rgba(45, 45, 45, 0.9);
		border: 2px solid #8b4513;
		border-radius: 8px;
		padding: 1rem;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.rule-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.rule-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.05) 50%, transparent 70%);
		pointer-events: none;
	}

	.rule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		position: relative;
		z-index: 1;
	}

	.rule-number {
		background: #ffd700;
		color: #000;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.rule-category {
		background: rgba(139, 69, 19, 0.3);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #f5f5f5;
		font-weight: bold;
	}

	.rule-content {
		position: relative;
		z-index: 1;
	}

	.rule-text {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		line-height: 1.4;
		color: #f5f5f5;
	}

	.rule-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.drink-icon {
		font-size: 2rem;
		color: #ffd700;
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.rule-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.game-footer {
		text-align: center;
	}

	.game-footer h3 {
		color: #ffd700;
		margin-bottom: 1rem;
	}

	.game-footer ol {
		text-align: left;
		margin: 0;
		padding-left: 1.5rem;
	}

	.game-footer li {
		margin-bottom: 0.5rem;
		color: #ccc;
	}

	@media (max-width: 768px) {
		.game-header {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.video-info {
			flex-direction: column;
			text-align: center;
		}

		.video-thumbnail {
			width: 100%;
			max-width: 300px;
			height: auto;
		}

		.game-meta {
			justify-content: center;
		}

		.rules-header {
			flex-direction: column;
			gap: 1rem;
		}

		.rules-actions {
			flex-direction: column;
		}

		.rule-card {
			padding: 0.75rem;
		}

		.rule-header {
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}

		.rule-actions {
			flex-direction: column;
			gap: 0.5rem;
			align-items: flex-start;
		}

		.drink-icon {
			font-size: 1.5rem;
		}

		.modal-content {
			margin: 1rem;
			max-width: calc(100vw - 2rem);
		}

		.form-row {
			flex-direction: column;
		}
	}

	/* Rules Header */
	.rules-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.rules-header h2 {
		margin: 0;
	}

	.rules-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Custom Rule Styling */
	.custom-rule {
		border-color: #00ff7f;
		background: rgba(0, 255, 127, 0.05);
	}

	.custom-rule::before {
		background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 127, 0.1) 50%, transparent 70%);
	}

	.custom-badge {
		background: rgba(0, 255, 127, 0.3);
		color: #00ff7f;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
	}

	.delete-rule-btn {
		background: rgba(220, 53, 69, 0.3);
		border: 1px solid #dc3545;
		color: #ff6b6b;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.3s ease;
	}

	.delete-rule-btn:hover {
		background: rgba(220, 53, 69, 0.5);
		transform: scale(1.05);
	}

	.reroll-rule-btn {
		background: rgba(255, 215, 0, 0.3);
		border: 1px solid #ffd700;
		color: #ffd700;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.3s ease;
	}

	.reroll-rule-btn:hover:not(:disabled) {
		background: rgba(255, 215, 0, 0.5);
		transform: scale(1.05);
	}

	.reroll-rule-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.reroll-rule-btn .loading {
		width: 12px;
		height: 12px;
		border: 1px solid transparent;
		border-top: 1px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: rgba(45, 45, 45, 0.95);
		border: 2px solid #8b4513;
		border-radius: 8px;
		padding: 2rem;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.modal-header h3 {
		margin: 0;
		color: #ffd700;
		font-size: 1.5rem;
	}

	.modal-close {
		background: none;
		border: none;
		color: #ccc;
		font-size: 2rem;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.modal-close:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	/* Form Styles */
	.custom-rule-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-group label {
		color: #ffd700;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.form-group textarea,
	.form-group select {
		background: rgba(30, 30, 30, 0.9);
		border: 2px solid #8b4513;
		border-radius: 4px;
		padding: 0.75rem;
		color: #f5f5f5;
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #ffd700;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	/* Button Styles */
	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-family: inherit;
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

	.btn-secondary:hover:not(:disabled) {
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
</style> 