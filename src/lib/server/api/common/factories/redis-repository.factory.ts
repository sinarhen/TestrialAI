import { Container } from '@needle-di/core';
import { RedisService } from '../../db/redis/redis.service';

export abstract class RedisRepository<T extends string> {
	protected readonly redis = new Container().get(RedisService);
	readonly prefix: T | string = '';
}
