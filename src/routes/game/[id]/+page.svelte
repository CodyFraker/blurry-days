<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getDrinkName } from '$lib/rules/ruleEngine';
	import { CategoryEnum, DrinkEnum } from '$lib/db/schema';
	import FilmStrip from '$lib/components/FilmStrip.svelte';
	import { Dialog } from 'bits-ui';

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
	$: ruleTexts = rules.map((rule) => rule.text);

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
			rules = rules.map((rule) => (rule.id === ruleId ? data.rule : rule));
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
	<div class="loading-state">
		<div class="loading"></div>
		<p>Loading your drinking game...</p>
	</div>
{:else if error}
	<div class="error-container">
		<div class="error-message">
			<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
			</svg>
			<div>
				<h2>Game Not Found</h2>
				<p>The game you're looking for doesn't exist or has expired.</p>
			</div>
		</div>
		<a href="/" class="btn btn-primary">Create New Game</a>
	</div>
{:else if game}
	<div class="game-page">
		<div class="game-header">
			<div class="video-info">
				<img src={game.videoThumbnail} alt={game.videoTitle} class="video-thumbnail" />
				<div class="video-details">
					<h1 class="game-title">{game.title}</h1>
					<p class="video-title">{game.videoTitle}</p>
					<div class="game-meta">
						<span class="badge badge-primary">
							🍻 {getIntoxicationLabel(game.intoxicationLevel)}
						</span>
						<span class="badge badge-secondary">
							⏰ Expires {formatDate(game.expiresAt)}
						</span>
					</div>
				</div>
			</div>

			<div class="share-section">
				<button class="btn btn-secondary" on:click={copyShareLink}>
					{copied ? '✅ Copied!' : '📋 Share Game'}
				</button>
				<p class="share-note">Share this link with your friends to play together!</p>
			</div>
		</div>

		<div class="rules-section">
			<div class="rules-header">
				<h2 class="section-title">📜 The Rules</h2>
				<p class="section-description">Follow these rules as you watch the video. Drink responsibly!</p>
			</div>
			
			<div class="rules-actions">
				<button class="btn btn-primary" on:click={rerollRules} disabled={isRerolling}>
					{#if isRerolling}
						<span class="loading"></span>
						<span>Rerolling...</span>
					{:else}
						<span>🎲</span>
						<span>Reroll All Rules</span>
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

		<FilmStrip rules={ruleTexts} />

		<div class="rules-grid-container">
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
									on:click={() => rerollSingleRule(rule.id)}
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
		</div>
	</div>
{/if}

<style>
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

	.error-message h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.error-message p {
		margin: 0;
		font-size: 0.875rem;
	}

	.game-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
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
		border-radius: 12px;
		border: 1px solid #e5e7eb;
		flex-shrink: 0;
	}

	.video-details {
		flex: 1;
	}

	.game-title {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.video-title {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 1.125rem;
	}

	.game-meta {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.share-section {
		text-align: center;
	}

	.share-note {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0.5rem 0 0 0;
	}

	.rules-section {
		margin-bottom: 3rem;
	}

	.rules-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		letter-spacing: -0.025em;
	}

	.section-description {
		font-size: 1.125rem;
		color: #6b7280;
		margin: 0;
	}

	.rules-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.rules-grid-container {
		margin-bottom: 3rem;
	}

	.rules-grid {
		display: grid;
		gap: 1.5rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.rule-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		position: relative;
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
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
		flex-grow: 1;
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
		margin-top: auto;
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

	.action-btn .loading {
		width: 12px;
		height: 12px;
		border: 1px solid transparent;
		border-top: 1px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	/* Custom Rule Styling */
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

	/* Modal Styles */
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
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		width: 90%;
		max-width: 500px;
		z-index: 50;
		border: 1px solid #e5e7eb;
	}

	.modal-title {
		margin: 0 0 1.5rem 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
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

	/* Responsive design */
	@media (max-width: 768px) {
		.game-header {
			grid-template-columns: 1fr;
			gap: 1.5rem;
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

		.game-title {
			font-size: 1.75rem;
		}

		.section-title {
			font-size: 1.75rem;
		}

		.rules-actions {
			flex-direction: column;
		}

		.rules-actions .btn {
			width: 100%;
		}

		.rule-header {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.rule-footer {
			flex-direction: column;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.rule-actions {
			align-self: flex-end;
		}

		.modal-content {
			margin: 1rem;
			max-width: calc(100vw - 2rem);
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.modal-actions {
			flex-direction: column;
		}

		.modal-actions .btn {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.game-page {
			padding: 0 0.5rem;
		}

		.game-title {
			font-size: 1.5rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.rule-card {
			padding: 1rem;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.game-title {
			color: #f9fafb;
		}

		.video-title {
			color: #9ca3af;
		}

		.section-title {
			color: #f9fafb;
		}

		.section-description {
			color: #9ca3af;
		}

		.rule-card {
			background: #1f2937;
			border-color: #374151;
		}

		.rule-text {
			color: #f9fafb;
		}

		.drink-name {
			color: #9ca3af;
		}

		.rule-category {
			background: #374151;
			color: #d1d5db;
		}

		.action-btn {
			border-color: #4b5563;
			color: #9ca3af;
		}

		.action-btn:hover {
			background: #374151;
			border-color: #6b7280;
		}

		.custom-rule {
			background: #064e3b;
			border-color: #10b981;
		}

		.modal-content {
			background: #1f2937;
			border-color: #374151;
		}

		.modal-title {
			color: #f9fafb;
		}

		.error-message {
			background: #450a0a;
			border-color: #7f1d1d;
			color: #fca5a5;
		}
	}
</style> 