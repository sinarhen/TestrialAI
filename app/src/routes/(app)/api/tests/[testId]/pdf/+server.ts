import type { RequestHandler } from './$types';
import puppeteer from 'puppeteer';

export const GET: RequestHandler = async ({ params, url }) => {
	const { testId } = params;

	const baseUrl = url.origin; // SvelteKit 1.0+ "url.origin" is the domain of the current request
	const exportUrl = `${baseUrl}/test/${testId}/pdf`;

	// 2) Launch Puppeteer
	const browser = await puppeteer.launch({});

	try {
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

		// 6) Return the PDF as a response
		return new Response(pdfBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				// Prompt a download with a filename
				'Content-Disposition': `attachment; filename="test-${testId}.pdf"`
			}
		});
	} catch (error) {
		console.error('Puppeteer PDF error:', error);
		await browser.close();
		return new Response('Failed to generate PDF', { status: 500 });
	}
};
