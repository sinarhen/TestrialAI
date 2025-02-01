import { container, injectable } from 'tsyringe';
import { ConfigService } from '../common/configs/config.service';
import { DevMailerService } from './dev-mailer.service';
import { ProdMailerService } from './prod-mailer.service';
import type { Mailer, SendProps } from './interfaces/mailer.interface';

@injectable()
export class MailerService implements Mailer {
	private mailer: Mailer;
	constructor(
		private configService = container.resolve(ConfigService),
		private prodMailer = container.resolve(ProdMailerService),
		private devMailer = container.resolve(DevMailerService)
	) {
		this.mailer = this.configService.envs.ENV === 'prod' ? this.prodMailer : this.devMailer;
	}

	async send(data: SendProps) {
		await this.mailer.send(data);
	}
}
