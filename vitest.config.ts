import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	esbuild: {
		jsx: 'automatic'
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup/vitest.setup.ts'],
		include: ['lib/**/*.test.ts', 'tests/unit/**/*.test.ts', 'components/**/*.test.tsx'],
		exclude: ['tests/integration/**']
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '.')
		}
	}
});
