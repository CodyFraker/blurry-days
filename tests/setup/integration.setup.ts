import { beforeEach } from 'vitest';
import { getTestDb, truncateCatalogTables } from '../helpers/db';

beforeEach(async () => {
	await truncateCatalogTables(getTestDb());
});
