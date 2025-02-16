import { container, injectable } from 'tsyringe';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { ConfigService } from '../configs/config.service';

@injectable()
export class TokenService {
	private readonly algorithm = 'aes-256-gcm';
	private key: Buffer;

	constructor(private readonly configService = container.resolve(ConfigService)) {
		// Hash the secret to ensure we always have a 32-byte key
		this.key = createHash('sha256').update(this.configService.envs.TOKEN_SECRET).digest();
	}

	encodeTestSessionToken({
		testSessionId,
		participantId
	}: {
		testSessionId: string;
		participantId: string;
	}): string {
		const iv = randomBytes(12);
		const cipher = createCipheriv(this.algorithm, this.key, iv);

		const payload = `${testSessionId}:${participantId}`;
		let encrypted = cipher.update(payload, 'utf8', 'base64url');
		encrypted += cipher.final('base64url');
		const authTag = cipher.getAuthTag();

		return `${iv.toString('base64url')}.${encrypted}.${authTag.toString('base64url')}`;
	}

	decodeTestSessionToken(token: string): { testSessionId: string; participantId: string } {
		try {
			const [ivStr, encrypted, authTagStr] = token.split('.');
			const iv = Buffer.from(ivStr, 'base64url');
			const authTag = Buffer.from(authTagStr, 'base64url');

			const decipher = createDecipheriv(this.algorithm, this.key, iv);
			decipher.setAuthTag(authTag);
			let decrypted = decipher.update(encrypted, 'base64url', 'utf8');
			decrypted += decipher.final('utf8');

			const [testSessionId, participantId] = decrypted.split(':');

			return { testSessionId, participantId };
		} catch (err) {
			console.error(err);
			throw new Error('Invalid session token');
		}
	}
}
