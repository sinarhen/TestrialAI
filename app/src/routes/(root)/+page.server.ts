import * as auth from '@/server/auth';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { generateSurvey } from '@/server/openai/presets/generateSurvey';
import type { PageServerLoad } from './$types';
import type { Question, QuestionSchema, Survey, SurveySchema} from "@/types";
import { generateQuestion } from '@/server/openai/presets/generateQuestion';

export const load: PageServerLoad = async ({locals}) => {
	// select all surveys from the database related to the user with questions
	const history = locals.user ? await db.query.surveys.findMany({
		where: (surveys, {eq}) => eq(surveys.userId, locals.user!.id),
		with: {
			questions: {
				with: {
					options: true
				}
			},
		},
		orderBy: (surveys, {desc}) => desc(surveys.updatedAt)
	}): null
	return {
		user: locals.user,
		history
	}
};

export const actions: Actions = {
	generateQuestion: async ({request, locals}) => {
		if (!locals.session || !locals.user){
			return fail(401, {message: "Unauthorized"})
		}
		const data = await request.formData();
		const topic = data.get('topic');

		if (!topic || typeof topic !== 'string') {
			return fail(400, { prompt: 'Topic is required' });
		}

		const survey = data.get('survey');
		if (!survey || typeof survey !== 'string') {
			return fail(400, { prompt: 'Survey is required' });
		}
		try {
			const currentSurvey = JSON.parse(survey) as Survey;

			if (!currentSurvey) {
				console.error("Invalid survey")
				console.dir(currentSurvey, {depth: null})
				return fail(400, { prompt: 'Invalid survey' });
			}

			const response = await generateQuestion({
				topic,
				currentSurvey
			});
			const content = response.choices[0].message.content;
			if (!content) {
				return fail(500, { message: 'An error has occurred while generating.' });
			}

			const generationResult = JSON.parse(content) as QuestionSchema;

			console.dir(generationResult, {depth: null});
			await db.transaction(async (tx) => {
				const [dbQuestion] = await tx.insert(table.questions).values({
					...generationResult,
					surveyId: currentSurvey.id,
				}).returning({id: table.questions.id});

				if (!dbQuestion) {
					throw new Error("Failed to insert question");
				}

				for (const option of generationResult.options) {
					await tx.insert(table.options).values({
						...option,
						questionId: dbQuestion.id, 
					});
				}
			})

		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred while generating.' });
		}
	},
	startGeneration: async ({
		request, locals
							}) => {
		if (!locals.session || !locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
		const data = await request.formData();
		const topic = data.get('topic');

		if (!topic || typeof topic !== 'string') {
			return fail(400, { prompt: 'Topic is required' });
		}

		try {
			const response = await generateSurvey({
				topic,
				difficulty: "Medium",
				numberOfQuestions: 8,
			});
			const content = response.choices[0].message.content;
			if (!content) {
				return fail(500, { message: 'An error has occurred while generating.' });
			}

			const generationResult = JSON.parse(content) as SurveySchema;


			// Start transaction
			await db.transaction(async (tx) => {
				// Insert the survey
				const [survey] = await tx.insert(table.surveys).values({
					...generationResult,
					userId: locals.user!.id,
				}).returning({id: table.surveys.id}); // Returning the survey to get its ID

				if (!survey) {
					throw new Error("Failed to insert survey");
				}

				// Iterate over questions and insert them
				for (const question of generationResult.questions) {
					const [dbQuestion] = await tx.insert(table.questions).values({
						...question,
						surveyId: survey.id,
					}).returning({id: table.questions.id}); // Returning the question to get its ID

					if (!dbQuestion) {
						throw new Error("Failed to insert question");
					}

					// Insert options related to the question
					for (const option of question.options) {
						await tx.insert(table.options).values({
							...option,
							questionId: dbQuestion.id, // Associate with question ID
						});
					}
				}
			});

			return {
				generationResult,
			};
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred while generating.' });
		}

	},
	logout: async (event) => {
		if (!event.locals.session) {
			return redirect(302, '/');
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return;
	},
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { username: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { password: 'Invalid password' });
		}

		const results = await db.select().from(table.users).where(eq(table.users.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, { password: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return { success: true };
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { username: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { password: 'Password must be between 6 and 255 characters' });
		}
		const existingUser = (
			await db.select().from(table.users).where(eq(table.users.username, username))
		).at(0);
		if (existingUser) {
			return fail(400, { username: 'Username already exists' });
		}
		const userId = generateUserId();
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.users).values({ id: userId, username, passwordHash });

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.log(e);
			return fail(500, { message: 'An error has occurred' });
		}
		return { success: true };
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
