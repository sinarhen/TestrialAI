import { Redis } from 'ioredis';
import { container, injectable } from 'tsyringe';
import { ConfigService } from '../../common/configs/config.service';

@injectable()
export class RedisService {
	private _redis?: Redis;

	constructor(private configService = container.resolve(ConfigService)) {}

	private get redis(): Redis {
		if (!this._redis) {
			const redisUrl = this.configService.envs.REDIS_URL;
			
			// Handle Upstash Redis URL format
			if (redisUrl.includes('upstash.io')) {
				// Extract host and port from URL like: redis://default@fond-ox-10685.upstash.io:6380
				const url = new URL(redisUrl);
				this._redis = new Redis({
					host: url.hostname,
					port: parseInt(url.port),
					password: this.configService.envs.UPSTASH_REDIS_REST_TOKEN || url.password,
					username: url.username || 'default',
					tls: url.protocol === 'rediss:' ? {} : undefined,
					lazyConnect: true,
					retryDelayOnFailover: 100,
					maxRetriesPerRequest: 3
				});
			} else {
				// Standard Redis URL
				this._redis = new Redis(redisUrl);
			}
		}
		return this._redis;
	}

	async get(data: { prefix: string; key: string }): Promise<string | null> {
		return this.redis.get(`${data.prefix}:${data.key}`);
	}

	async set(data: { prefix: string; key: string; value: string }): Promise<void> {
		await this.redis.set(`${data.prefix}:${data.key}`, data.value);
	}

	async delete(data: { prefix: string; key: string }): Promise<void> {
		await this.redis.del(`${data.prefix}:${data.key}`);
	}

	async setWithExpiry(data: {
		prefix: string;
		key: string;
		value: string;
		expiry: number;
	}): Promise<void> {
		await this.redis.set(`${data.prefix}:${data.key}`, data.value, 'EX', Math.floor(data.expiry));
	}
}
