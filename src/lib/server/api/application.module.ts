import { container, injectable } from 'tsyringe';
import { ConfigService } from './common/configs/config.service';
import { ApplicationController } from './application.controller';

@injectable()
export class ApplicationModule {
	constructor(
		private applicationController = container.resolve(ApplicationController),
		private configService = container.resolve(ConfigService)
		// private storageService = container.resolve(StorageService)
	) {}

	async app() {
		return this.applicationController.registerControllers();
	}

	async start() {
		const app = this.app();
		await this.onApplicationStartup();

		// register shutdown hooks
		process.on('SIGINT', this.onApplicationShutdown);
		process.on('SIGTERM', this.onApplicationShutdown);

		console.log(`Api started on port ${this.configService.envs.PORT}`);
		return app;
	}

	private async onApplicationStartup() {
		console.log('Application startup...');
		// validate configs
		this.configService.validateEnvs();
		// configure storage service
		// await this.storageService.configure();
	}

	private onApplicationShutdown() {
		console.log('Shutting down...');
		process.exit();
	}
}
