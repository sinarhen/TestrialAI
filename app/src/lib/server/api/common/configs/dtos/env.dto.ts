import { z } from 'zod';

export const envsDto = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_ID: z.number({ coerce: true }),
  GOOGLE_CLIENT_SECRET: z.string(),
  SIGNING_SECRET: z.string(),
  ENV: z.enum(['dev', 'prod']),
  PORT: z.number({ coerce: true }),
 });

export type EnvsDto = z.infer<typeof envsDto>;