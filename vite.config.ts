import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	esbuild: {
		target: 'es2022'
	},
	ssr: {
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
			'reflect-metadata'
		]
	},
	build: {
		rollupOptions: {
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
				'reflect-metadata'
			]
		}
	}
});
