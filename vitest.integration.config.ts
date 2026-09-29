import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['tests/integration/**/*.test.ts'],
		fileParallelism: false,
		poolOptions: {
			threads: { singleThread: true }
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, '.')
		}
	}
});
