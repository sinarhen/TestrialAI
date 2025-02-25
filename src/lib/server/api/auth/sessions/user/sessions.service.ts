import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { container, injectable } from 'tsyringe';
import { SessionsRepository } from './sessions.repository';
import dayjs from 'dayjs';
import { RequestContextService } from '../../../common/services/request-context.service';
import { ConfigService } from '../../../common/configs/config.service';
import type { CreateSessionDto } from './dtos/create-session-dto';
import type { SessionDto } from './dtos/sessions.dto';
import { generateId } from '../../../common/utils/crypto';

// TODO: Move to base class
@injectable()
export class SessionsService {
	public readonly sessionCookieName = 'session';

	constructor(
		private sessionsRepository = container.resolve(SessionsRepository),
		private requestContextService = container.resolve(RequestContextService),
		private configService = container.resolve(ConfigService)
	) {}

	setSessionCookie(session: SessionDto) {
		return setSignedCookie(
			this.requestContextService.getContext(),
			this.sessionCookieName,
			session.id,
			this.configService.envs.SIGNING_SECRET,
			{
				httpOnly: true,
				sameSite: 'lax',
				secure: this.configService.envs.ENV === 'prod',
				path: '/',
				expires: session.expiresAt
			}
		);
	}

	async getSessionCookie(): Promise<string | null> {
		const session = await getSignedCookie(
			this.requestContextService.getContext(),
			this.configService.envs.SIGNING_SECRET,
			this.sessionCookieName
		);
		if (!session) return null;
		return session;
	}

	deleteSessionCookie() {
		return deleteCookie(this.requestContextService.getContext(), this.sessionCookieName);
	}

	async createSession(userId: string): Promise<SessionDto> {
		const session: CreateSessionDto = {
			id: this.generateSessionToken(),
			userId,
			expiresAt: dayjs().add(30, 'day').toDate()
		};

		await this.sessionsRepository.create(session);
		return { ...session };
	}

	async validateSession(sessionId: string): Promise<SessionDto | null> {
		// Check if session exists
		const existingSession = await this.sessionsRepository.get(sessionId);

		// If session does not exist, return null
		if (!existingSession) return null;

		// If session exists, check if it should be extended
		const shouldExtendSession = dayjs(existingSession.expiresAt).diff(Date.now(), 'day') < 15;

		// If session should be extended, update the session in the database
		if (shouldExtendSession) {
			existingSession.expiresAt = dayjs().add(30, 'day').toDate();
			await this.sessionsRepository.create({ ...existingSession });
			return { ...existingSession };
		}

		return { ...existingSession };
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.sessionsRepository.delete(sessionId);
	}

	private generateSessionToken(): string {
		return generateId();
	}
}
