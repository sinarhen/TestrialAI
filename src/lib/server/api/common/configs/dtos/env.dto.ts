import { z } from 'zod';

export const envsDto = z.object({
	DATABASE_URL: z.string(),
	REDIS_URL: z.string(),
	OPENAI_API_KEY: z.string(),
	OPENAI_DEFAULT_MODEL: z.string(),
	OPENAI_COMPLETION_TOKEN_LIMIT: z.number({ coerce: true }),
	GITHUB_CLIENT_SECRET: z.string(),
	GITHUB_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_ID: z.string({ coerce: true }),
	GOOGLE_CLIENT_SECRET: z.string(),
	SIGNING_SECRET: z.string(),
	ENV: z.enum(['dev', 'prod']),
	PORT: z.number({ coerce: true }),
	DEV_BASE_URL: z.string(),
	PROD_BASE_URL: z.string()
});

export type EnvsDto = z.infer<typeof envsDto>;
