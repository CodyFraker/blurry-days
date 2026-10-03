import { applyMigrations } from '../lib/db/applyMigrations';
import { assertDatabaseConnection } from '../lib/db/assertDatabaseConnection';

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
