import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	esbuild: {
		target: 'es2022'
	},
	ssr: {
		noExternal: ['@sveltejs/kit', 'svelte'],
		external: [
			'puppeteer-core',
			'@sparticuz/chromium',
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
			'partial-json'
		]
	},
	build: {
		rollupOptions: {
			external: [
				'puppeteer-core',
				'@sparticuz/chromium',
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
				'reflect-metadata'
			]
		}
	}
});
