import { container, injectable } from 'tsyringe';
import { UsersRepository } from './users.repository';
import type { UpdateUserDto } from './dtos/update-user.dto';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { Provider } from './tables/users.table';

@injectable()
export class UsersService {
	constructor(
		private usersRepository = container.resolve(UsersRepository)
		// private storageService = container.resolve(StorageService)
	) {}

	async update(userId: string, updateUserDto: UpdateUserDto) {
		// if (updateUserDto?.avatar) {
		// 	const { key } = await this.storageService.upload({ file: updateUserDto.avatar });
		// 	await this.usersRepository.update(userId, { avatar: key });
		// }
		return this.usersRepository.update(userId, updateUserDto);
	}

	async create(user: CreateUserDto) {
		return this.usersRepository.create(user);
	}

	async findUserByEmail(email: string) {
		return this.usersRepository.findOneByEmail(email);
	}

	async findUserByProviderId(provider: Provider, providerId: string) {
		return this.usersRepository.findOneByProvider(provider, providerId);
	}

	async getUserByUsername(username: string) {
		return this.usersRepository.findOneByUsername(username);
	}
}
