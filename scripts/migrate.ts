import { applyMigrations } from '../lib/db/applyMigrations';
import { assertDatabaseConnection } from '../lib/db/assertDatabaseConnection';

async function main(): Promise<void> {
	try {
		await applyMigrations();
	} catch (error) {
		console.error('[db:migrate] applying migrations failed:', error);
		process.exit(1);
	}

	try {
		await assertDatabaseConnection();
	} catch (error) {
		console.error('[db:migrate] database connection failed:', error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
