import { container, injectable } from 'tsyringe';
import puppeteer from 'puppeteer-core';
import { ConfigService } from '@api/common/configs/config.service';

// @ts-ignore - No types available for @sparticuz/chromium
const chromium = require('@sparticuz/chromium');

@injectable()
export class PdfService {
	constructor(private configService = container.resolve(ConfigService)) {}

	public async generateTestPdf(testId: string) {
		const exportUrl = `${this.configService.envs.BASE_URL}/test/${testId}/pdf`;

		// Configure chromium for serverless environment
		const browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
		});

		const page = await browser.newPage();
		await page.goto(exportUrl, { waitUntil: 'networkidle0' });

		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: {
				top: '1cm',
				right: '1cm',
				bottom: '1cm',
				left: '1cm'
			}
		});

		await browser.close();

		return pdfBuffer;
	}
}
