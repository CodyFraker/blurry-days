import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL || 'postgres://grainydays:grainydays_dev@localhost:5432/grainydays'
	}
} satisfies Config; 