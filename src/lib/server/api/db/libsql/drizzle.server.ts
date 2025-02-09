import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './drizzle-schema';
import { container, injectable, singleton } from 'tsyringe';
import { ConfigService } from '../../common/configs/config.service';

// await drizzleDb.transaction(async (tx) => {
// 	await tx.insert(schema.testsTable).values({
// 		id: 'test_id',
// 		userId: 'user_id',
// 		title: 'test title'
// 	});

// 	await tx.insert(schema.questionsTable).values({
// 		id: 'question_id',
// 		testId: 'test_id',
// 		question: 'question text',
// 		answerType: 'single',
// 		options: [
// 			{
// 				id: 'option_id',
// 				value: 'option text',
// 				isCorrect: true
// 			}
// 		]
// 	});
// });
console.dir(schema, { depth: 1 });

@injectable()
export class DrizzleService {
	public db: LibSQLDatabase<typeof schema>;
	public schema = schema;

	constructor(private configService = container.resolve(ConfigService)) {
		const client = createClient({ url: configService.envs.DATABASE_URL });

		this.db = drizzle(client, { schema: schema });
	}
}
