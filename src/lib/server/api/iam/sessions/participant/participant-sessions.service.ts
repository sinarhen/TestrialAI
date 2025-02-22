import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { container, injectable } from 'tsyringe';
import dayjs from 'dayjs';
import { RequestContextService } from '../../../common/services/request-context.service';
import { ConfigService } from '../../../common/configs/config.service';
import { generateId } from '../../../common/utils/crypto';
import type { ParticipantSessionDto } from './dtos/participant-session.dto';
import { ParticipantSessionsRepository } from './participant-sessions.repository';
import type { CreateParticipantSessionDto } from './dtos/create-participant-session.dto';

@injectable()
export class SessionsService {
	public readonly sessionCookieName = 'session';

	constructor(
		private participantSessionsRepository = container.resolve(ParticipantSessionsRepository),
		private requestContextService = container.resolve(RequestContextService),
		private configService = container.resolve(ConfigService)
	) {}

	setParticipantSessionCookie(session: ParticipantSessionDto) {
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

	async getParticipantSessionCookie(): Promise<string | null> {
		const session = await getSignedCookie(
			this.requestContextService.getContext(),
			this.configService.envs.SIGNING_SECRET,
			this.sessionCookieName
		);
		if (!session) return null;
		return session;
	}

	deleteParticipantSessionCookie() {
		return deleteCookie(this.requestContextService.getContext(), this.sessionCookieName);
	}

	async createParticipantSession(anonymousUserId: string): Promise<ParticipantSessionDto> {
		const session: CreateParticipantSessionDto = {
			id: this.generateSessionToken(),
			anonymousUserId,
			expiresAt: dayjs().add(30, 'day').toDate()
		};

		await this.participantSessionsRepository.create(session);
		return { ...session };
	}

	async validateSession(sessionId: string): Promise<ParticipantSessionDto | null> {
		// Check if session exists
		const existingSession = await this.participantSessionsRepository.get(sessionId);

		// If session does not exist, return null
		if (!existingSession) return null;

		// If session exists, check if it should be extended
		const shouldExtendSession = dayjs(existingSession.expiresAt).diff(Date.now(), 'day') < 15;

		// If session should be extended, update the session in the database
		if (shouldExtendSession) {
			existingSession.expiresAt = dayjs().add(30, 'day').toDate();
			await this.participantSessionsRepository.create({ ...existingSession });
			return { ...existingSession };
		}

		return { ...existingSession };
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.participantSessionsRepository.delete(sessionId);
	}

	private generateSessionToken(): string {
		return generateId();
	}
}
