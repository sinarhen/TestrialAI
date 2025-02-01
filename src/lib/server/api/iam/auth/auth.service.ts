import { container, injectable } from 'tsyringe';
import { RegisterRequestsRepository } from './dtos/register-requests/register-requests.repository';
import { LoginVerificationEmail } from '../../mail/templates/login-verification.template';
import { BadRequest } from '../../common/utils/exceptions';
import { WelcomeEmail } from '../../mail/templates/welcome.template';
import { SessionsService } from '../sessions/sessions.service';
import { UsersRepository } from '../../users/users.repository';
import { VerificationCodesService } from '../../common/services/verification-codes.service';
import { UsersService } from '../../users/users.service';
import { MailerService } from '../../mail/mailer.service';
import type { VerifyRegisterRequestDto } from './dtos/register-requests/verify-register-request.dto';
import type { LoginDto } from './dtos/login/login.dto';
import { HashingService } from '../../common/services/hashing.service';
import type { SessionDto } from '../sessions/dtos/sessions.dto';
import type { BaseExternalLoginProviderService } from '../external-login-providers/external-login-provider.service';
import type { Provider } from '../../users/tables';
import { GitHubLoginService } from '../external-login-providers/github/github-login.service';
import { GoogleLoginService } from '../external-login-providers/google/google-login.service';

@injectable()
export class AuthService {
	constructor(
		private registerRequestsRepository = container.resolve(RegisterRequestsRepository),
		private usersRepository = container.resolve(UsersRepository),
		private verificationCodesService = container.resolve(VerificationCodesService),
		private usersService = container.resolve(UsersService),
		private sessionsService = container.resolve(SessionsService),
		private mailer = container.resolve(MailerService),
		private hashingService = container.resolve(HashingService),
		private gitHubLoginService = container.resolve(GitHubLoginService),
		private googleLoginService = container.resolve(GoogleLoginService)
	) {}

	public getExternalProviderService(provider: Provider): BaseExternalLoginProviderService {
		if (provider === 'github') {
			return this.gitHubLoginService;
		}
		if (provider === 'google') {
			return this.googleLoginService;
		}
		throw new Error('Invalid provider');
	}

	// TODO: handle suspicious login attempts
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async login(request: LoginDto, isSuspicious?: boolean): Promise<SessionDto> {
		const user = await this.usersRepository.findOneByEmail(request.email);

		if (!user) throw BadRequest('Invalid email or password');
		if (!user.passwordHash)
			throw BadRequest(
				'You are signed up with a provider. Please sign in with that provider.(Google, GitHub, etc.)'
			);

		const isValidPassword = await this.hashingService.compare(request.password, user.passwordHash);
		if (!isValidPassword) throw BadRequest('Invalid email or password');

		return this.sessionsService.createSession(user.id);
	}

	async verify(request: VerifyRegisterRequestDto): Promise<SessionDto> {
		// find the hashed verification code for the email
		const registerRequest = await this.registerRequestsRepository.get(request.email);

		// if no hashed code is found, the request is invalid
		if (!registerRequest) throw BadRequest('Invalid code');

		// verify the code
		const isValid = await this.verificationCodesService.verify({
			verificationCode: request.verificationCode,
			hashedVerificationCode: registerRequest.hashedCode
		});

		// if the code is invalid, throw an error
		if (!isValid) throw BadRequest('Invalid code');

		// burn the login request so it can't be used again
		await this.registerRequestsRepository.delete(request.email);

		// check if the user already exists
		const existingUser = await this.usersService.findOneByEmail(request.email);

		// if the user exists, log them in, otherwise create a new user and log them in
		return existingUser
			? this.authExistingUser({ userId: existingUser.id })
			: this.authNewUser(request);
	}

	async sendVerificationCode(email: string) {
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

	private async authNewUser(user: VerifyRegisterRequestDto): Promise<SessionDto> {
		// create a new user
		const newUser = await this.usersService.create({
			email: user.email,
			username: user.username,
			passwordHash: await this.hashingService.hash(user.password),
			firstName: user.firstName,
			lastName: user.lastName
		});

		// send the welcome email
		await this.mailer.send({
			to: user.email,
			template: new WelcomeEmail()
		});

		// create a new session
		return this.sessionsService.createSession(newUser.id);
	}

	private async authExistingUser({ userId }: { userId: string }) {
		return this.sessionsService.createSession(userId);
	}
}
