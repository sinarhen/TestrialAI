import { injectable } from '@needle-di/core';
import { RedisRepository } from '../../common/factories/redis-repository.factory';

type RegisterRequest = { email: string; hashedCode: string };

@injectable()
export class RegisterRequestsRepository extends RedisRepository<'login-request'> {
	async set(args: RegisterRequest) {
		return this.redis.setWithExpiry({
			prefix: this.prefix,
			key: args.email.toLowerCase(),
			value: args.hashedCode,
			expiry: 60 * 15
		});
	}

	delete(email: string) {
		return this.redis.delete({ prefix: this.prefix, key: email.toLowerCase() });
	}

	async get(email: string): Promise<RegisterRequest | null> {
		const hashedCode = await this.redis.get({
			prefix: this.prefix,
			key: email.toLowerCase()
		});
		if (!hashedCode) return null;
		return { email, hashedCode: hashedCode };
	}
}
