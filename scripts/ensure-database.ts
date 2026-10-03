import { ensureDatabase } from '../lib/db/ensureDatabase';

try {
	await ensureDatabase();
} catch (error) {
	console.error(error);
	process.exit(1);
}
