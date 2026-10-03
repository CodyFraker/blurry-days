import { ensureDatabase } from '../lib/db/ensureDatabase';

async function main(): Promise<void> {
	await ensureDatabase();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
