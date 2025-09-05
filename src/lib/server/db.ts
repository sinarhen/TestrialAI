// Export database instance for use in SvelteKit server-side code
import { container } from 'tsyringe';
import { DrizzleService } from './api/db/libsql/drizzle.server';

const drizzleService = container.resolve(DrizzleService);
export const db = drizzleService.db;
export const schema = drizzleService.schema;