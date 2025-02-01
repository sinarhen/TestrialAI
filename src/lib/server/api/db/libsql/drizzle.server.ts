import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './drizzle-schema';
import { container, singleton } from 'tsyringe';
import { ConfigService } from '../../common/configs/config.service';

@singleton()
export class DrizzleService {
	public db: LibSQLDatabase<typeof schema>;
	public schema = schema;

	constructor(private configService = container.resolve(ConfigService)) {
		const client = createClient({ url: configService.envs.DATABASE_URL });

		this.db = drizzle(client, { schema: this.schema });
		console.log('Initialized DrizzleService');
	}
}
