import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['lib/**/*.test.ts', 'tests/unit/**/*.test.ts'],
		exclude: ['tests/integration/**']
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '.')
		}
	}
});
