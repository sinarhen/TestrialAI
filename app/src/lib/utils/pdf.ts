import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;

import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { SurveyState } from '../../routes/(client)/survey/[id]/types';

export function exportSurveyToPdf(survey: SurveyState): void {
	//
	// 1. Build a flat array of Content items
	//
	const pdfContent: Content[] = [];

	// -- Title
	pdfContent.push({
		text: survey.title,
		style: 'h1'
	});

	// -- Difficulty
	pdfContent.push({
		text: `Difficulty: ${survey.difficulty}`,
		style: 'subheader',
		margin: [0, 0, 0, 10] // 4-tuple for top/right/bottom/left
	});

	// -- Total Questions
	pdfContent.push({
		text: `Total Questions: ${survey.questions.length}`
	});

	// For each question, push one or more Content items
	survey.questions.forEach((q, i) => {
		// The question heading
		pdfContent.push({
			text: `${i + 1}. ${q.question}`,
			style: 'h3',
			margin: [0, 20, 0, 0]
		});

		if (q.answerType === 'single' || q.answerType === 'multiple') {
			// Show options as a bullet list
			pdfContent.push({
				ul: (q.options ?? []).map((opt) => ({
					text: opt?.value ?? '(No value)',
					margin: [10, 5, 0, 0],
					backgroundColor: opt?.isCorrect ? '#c8e6c9' : '#ffcdd2'
				}))
			});
		} else if (q.answerType === 'text') {
			pdfContent.push({
				text: q.correctAnswer ? `Correct Answer: ${q.correctAnswer}` : '(User types an answer)',
				style: 'subheader'
			});
		}
	});

	//
	// 2. Assemble the doc definition
	//
	const docDefinition: TDocumentDefinitions = {
		content: pdfContent,
		styles: {
			h1: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 16]
			},
			h2: {
				fontSize: 16,
				bold: true
			},
			h3: {
				fontSize: 13,
				bold: true
			},
			subheader: {
				fontSize: 12,
				bold: true
			}
		},
		defaultStyle: {
			font: ''
		}
	};

	//
	// 3. Generate & download the PDF
	//
	pdfMake.createPdf(docDefinition).download(survey.title ?? 'survey.pdf');
}
