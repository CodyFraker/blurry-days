<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="app">
	<header class="header">
		<div class="container">
			<div class="header-content">
				<h1 class="logo">
					📸 Grainydays
				</h1>
				<p class="tagline">Drinking Game Generator</p>
			</div>
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
		background: #fafafa;
		color: #1a1a1a;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		width: 100%;
	}

	.header {
		background: #ffffff;
		border-bottom: 1px solid #e5e7eb;
		padding: 1.5rem 0;
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(8px);
		background: rgba(255, 255, 255, 0.95);
	}

	.header-content {
		text-align: center;
	}

	.logo {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
		color: #1f2937;
		letter-spacing: -0.025em;
	}

	.tagline {
		font-size: 1rem;
		margin: 0;
		color: #6b7280;
		font-weight: 400;
	}

	.main {
		flex: 1;
		padding: 2rem 0;
	}

	.footer {
		background: #ffffff;
		border-top: 1px solid #e5e7eb;
		padding: 1.5rem 0;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}

		.header {
			padding: 1rem 0;
		}

		.logo {
			font-size: 1.75rem;
		}

		.tagline {
			font-size: 0.875rem;
		}

		.main {
			padding: 1.5rem 0;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 0 0.75rem;
		}

		.logo {
			font-size: 1.5rem;
		}

		.tagline {
			font-size: 0.8rem;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.app {
			background: #111827;
			color: #f9fafb;
		}

		.header {
			background: rgba(31, 41, 55, 0.95);
			border-bottom-color: #374151;
		}

		.footer {
			background: #1f2937;
			border-top-color: #374151;
		}

		.logo {
			color: #f9fafb;
		}

		.tagline {
			color: #9ca3af;
		}
	}
</style> 