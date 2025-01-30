import type { ClientRequestOptions } from 'hono';
import { IamModule } from './domains/iam';
import { UsersModule } from './domains/users';
import { TanstackRequestOptions } from './request-options';
import { TestsModule } from './domains/tests';
import { QuestionsModule } from './domains/questions';

class TanstackQueryModule extends TanstackRequestOptions {
	iam = new IamModule(this.opts);
	users = new UsersModule(this.opts);
	tests = new TestsModule(this.opts);
	questions = new QuestionsModule(this.opts);
}

export const api = (opts?: ClientRequestOptions) => new TanstackQueryModule(opts);
