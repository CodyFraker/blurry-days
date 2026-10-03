export function resolveDatabaseUrl(): string {
	const defaultUrl = 'postgres://grainydays:grainydays_dev@localhost:5432/grainydays';
	if (process.env.RUN_INTEGRATION_TESTS === '1' && process.env.DATABASE_URL_TEST) {
		return process.env.DATABASE_URL_TEST;
	}
	return process.env.DATABASE_URL || process.env.DATABASE_URL_TEST || defaultUrl;
}
