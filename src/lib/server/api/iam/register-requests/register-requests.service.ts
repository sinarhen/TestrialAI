import { inject, injectable } from '@needle-di/core';
import { RegisterRequestsRepository } from './register-requests.repository';
import { LoginVerificationEmail } from '../../mail/templates/login-verification.template';
import { BadRequest } from '../../common/utils/exceptions';
import { WelcomeEmail } from '../../mail/templates/welcome.template';
import { SessionsService } from '../sessions/sessions.service';
import type { CreateRegisterRequestDto } from './dtos/create-register-request.dto';
import { UsersRepository } from '../../users/users.repository';
import { VerificationCodesService } from '../../common/services/verification-codes.service';
import { UsersService } from '../../users/users.service';
import { MailerService } from '../../mail/mailer.service';
import type { VerifyRegisterRequestDto } from './dtos/verify-register-request.dto';

@injectable()
export class RegisterRequestsService {
	constructor(
		private registerRequestsRepository = inject(RegisterRequestsRepository),
		private usersRepository = inject(UsersRepository),
		private verificationCodesService = inject(VerificationCodesService),
		private usersService = inject(UsersService),
		private sessionsService = inject(SessionsService),
		private mailer = inject(MailerService)
	) {}

	async verify(request: VerifyRegisterRequestDto) {
		// find the hashed verification code for the email
		const loginRequest = await this.registerRequestsRepository.get(request.email);

		// if no hashed code is found, the request is invalid
		if (!loginRequest) throw BadRequest('Invalid code');

		// verify the code
		const isValid = await this.verificationCodesService.verify({
			verificationCode: request.verificationCode,
			hashedVerificationCode: loginRequest.hashedCode
		});

		// if the code is invalid, throw an error
		if (!isValid) throw BadRequest('Invalid code');

		// burn the login request so it can't be used again
		await this.registerRequestsRepository.delete(request.email);

		// check if the user already exists
		const existingUser = await this.usersRepository.findOneByEmail(request.email);

		// if the user exists, log them in, otherwise create a new user and log them in
		return existingUser
			? this.authExistingUser({ userId: existingUser.id })
			: this.authNewUser(request);
	}

	async sendVerificationCode({ email }: CreateRegisterRequestDto) {
		// remove any existing login requests
		await this.registerRequestsRepository.delete(email);

		// generate a new verification code and hash
		const { verificationCode, hashedVerificationCode } =
			await this.verificationCodesService.generateCodeWithHash();

		// create a new login request
		await this.registerRequestsRepository.set({
			email,
			hashedCode: hashedVerificationCode
		});

		// send the verification email
		await this.mailer.send({
			to: email,
			template: new LoginVerificationEmail(verificationCode)
		});
	}

	private async authNewUser({ email }: { email: string }) {
		// create a new user
		const user = await this.usersService.create({
			email: email,
			username: email
		});

		// send the welcome email
		await this.mailer.send({
			to: email,
			template: new WelcomeEmail()
		});

		// create a new session
		return this.sessionsService.createSession(user.id);
	}

	private async authExistingUser({ userId }: { userId: string }) {
		return this.sessionsService.createSession(userId);
	}
}
