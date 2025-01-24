import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import * as schema from './drizzle-schema';
import { inject, injectable } from '@needle-di/core';
import { ConfigService } from '../../common/configs/config.service';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(client, { schema });


@injectable()
export class DrizzleService {
    public db: LibSQLDatabase<typeof schema>;
    public schema = schema

    constructor(private configService = inject(ConfigService)) {
        this.db = drizzle(client, { schema: this.schema })
    }
}