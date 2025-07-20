/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(
	defineConfig({
		plugins: [sveltekit()]
	}),
	defineConfig({
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	})
); 