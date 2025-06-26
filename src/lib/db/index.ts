import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://grainydays:grainydays_dev@localhost:5432/grainydays';

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle database instance
export const db = drizzle(client, { schema });

export { schema }; 