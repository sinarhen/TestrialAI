import { inject, injectable } from '@needle-di/core';
import puppeteer from 'puppeteer';
import { ConfigService } from '@api/common/configs/config.service';

@injectable()
export class PdfService {
	constructor(private configService = inject(ConfigService)) {}

	public async generateTestPdf(testId: string) {
		const exportUrl = `${this.configService.envs.BASE_URL}/test/${testId}/pdf`;

		// 2) Launch Puppeteer
		const browser = await puppeteer.launch({});

		const page = await browser.newPage();
		await page.goto(exportUrl, { waitUntil: 'networkidle0' });

		const pdfBuffer = await page.pdf({
			format: 'A4',
			// printBackground: true,
			margin: {
				top: '1cm',
				right: '1cm',
				bottom: '1cm',
				left: '1cm'
			}
		});

		// 5) Close browser
		await browser.close();

		return pdfBuffer;
	}
}
