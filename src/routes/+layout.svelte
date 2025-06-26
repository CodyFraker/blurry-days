<script lang="ts">
	import '../app.css';
</script>

<div class="app">
	<header class="header">
		<div class="container">
			<h1 class="logo">
				📸 Grainydays Drinking Game
			</h1>
			<p class="tagline">Generate custom drinking games from your favorite film photography videos</p>
		</div>
	</header>

	<main class="main">
		<div class="container">
			<slot />
		</div>
	</main>

	<footer class="footer">
		<div class="container">
			<p>&copy; 2024 Grainydays Drinking Game Generator</p>
		</div>
	</footer>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		color: #f5f5f5;
		font-family: 'Courier New', monospace;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.header {
		background: rgba(0, 0, 0, 0.8);
		border-bottom: 2px solid #8b4513;
		padding: 2rem 0;
		text-align: center;
	}

	.logo {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		color: #ffd700;
	}

	.tagline {
		font-size: 1.1rem;
		margin: 0;
		color: #ccc;
		font-style: italic;
	}

	.main {
		flex: 1;
		padding: 2rem 0;
	}

	.footer {
		background: rgba(0, 0, 0, 0.8);
		border-top: 2px solid #8b4513;
		padding: 1rem 0;
		text-align: center;
		color: #999;
		font-size: 0.9rem;
	}

	/* Retro film grain overlay */
	.app::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: 
			radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
			radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
		background-size: 50px 50px;
		pointer-events: none;
		z-index: 1;
	}

	/* Ensure content is above grain overlay */
	.header, .main, .footer {
		position: relative;
		z-index: 2;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.logo {
			font-size: 2rem;
		}

		.tagline {
			font-size: 1rem;
		}

		.container {
			padding: 0 0.5rem;
		}
	}
</style> 