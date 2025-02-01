import { container } from 'tsyringe';
import { RedisService } from '../../db/redis/redis.service';

export abstract class RedisRepository<T extends string> {
	protected readonly redis = container.resolve(RedisService);
	readonly prefix: T | string = '';
}
