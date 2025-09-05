import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import 'reflect-metadata';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			runtime: 'nodejs20.x',
			maxDuration: 30,
			split: true,
			external: [
				'puppeteer',
				'openai',
				'pdfmake', 
				'ioredis',
				'drizzle-orm',
				'@libsql/client',
				'nodemailer',
				'@node-rs/argon2',
				'axios',
				'highlight.js',
				'tsyringe',
				'reflect-metadata',
				'lodash',
				'uuid',
				'dayjs',
				'hono',
				'partial-json',
				'rate-limit-redis',
				'hono-rate-limiter'
			],
			isr: {
				expiration: false
			}
		}),
		alias: {
			'@/*': './src/lib/*',
			'@api/*': './src/lib/server/api/*',
			'@client/*': './src/lib/client/*'
		}
	}
};

export default config;
