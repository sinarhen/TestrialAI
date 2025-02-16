// import type { ClientRequestOptions } from 'hono';
// import { IamModule } from './domains/iam';
// import { UsersModule } from './domains/users';
// import { RequestOptions } from './request-options';
// import { TestsModule } from './domains/tests';
// import { QuestionsModule } from './domains/questions';

// class TanstackQueryModule extends RequestOptions {
// 	iam = new IamModule(this.opts);
// 	users = new UsersModule(this.opts);
// 	tests = new TestsModule(this.opts);
// 	questions = new QuestionsModule(this.opts);
// }

// export const api = (opts?: ClientRequestOptions) => new TanstackQueryModule(opts);

// WITHOUT Tanstack

import type { ClientRequestOptions } from 'hono';
import { honoClient } from '@/client/utils/api';
import { PUBLIC_DEV_BASE_URL, PUBLIC_PROD_BASE_URL } from '$env/static/public';
import { dev } from '$app/environment';

const baseUrl = dev ? PUBLIC_DEV_BASE_URL : PUBLIC_PROD_BASE_URL;
export const api = (opts?: ClientRequestOptions) => honoClient(baseUrl, opts);
