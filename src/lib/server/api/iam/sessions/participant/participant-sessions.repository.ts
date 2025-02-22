import { injectable } from 'tsyringe';
import { RedisRepository } from '../../../common/factories/redis-repository.factory';
import {
	createParticipantSessionDto,
	type CreateParticipantSessionDto
} from './dtos/create-participant-session.dto';

@injectable()
export class ParticipantSessionsRepository extends RedisRepository<'participant-session'> {
	async get(id: string): Promise<CreateParticipantSessionDto | null> {
		const response = await this.redis.get({ prefix: this.prefix, key: id });
		if (!response) return null;
		return createParticipantSessionDto.parse(JSON.parse(response));
	}

	delete(id: string) {
		return this.redis.delete({ prefix: this.prefix, key: id });
	}

	create(createParticipantSessionDto: CreateParticipantSessionDto) {
		return this.redis.setWithExpiry({
			prefix: this.prefix,
			key: createParticipantSessionDto.id,
			value: JSON.stringify(createParticipantSessionDto),
			expiry: Math.floor(+createParticipantSessionDto.expiresAt / 1000)
		});
	}
}
