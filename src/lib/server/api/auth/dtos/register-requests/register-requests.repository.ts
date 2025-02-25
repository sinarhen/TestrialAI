import { RedisRepository } from '@/server/api/common/factories/redis-repository.factory';
import { injectable } from 'tsyringe';

type RegisterRequest = { email: string; hashedCode: string };

@injectable()
export class RegisterRequestsRepository extends RedisRepository<'register-request'> {
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
