import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './drizzle-schema';
import { Container, inject, injectable } from '@needle-di/core';
import { ConfigService } from '../../common/configs/config.service';

@injectable()
export class DrizzleService {
	public db: LibSQLDatabase<typeof schema>;
	public schema = schema;

	constructor(private configService = inject(ConfigService)) {
		const client = createClient({ url: configService.envs.DATABASE_URL });

		this.db = drizzle(client, { schema: this.schema });
		console.log('Initialized DrizzleService');
	}
}

new Container().bind(DrizzleService);
