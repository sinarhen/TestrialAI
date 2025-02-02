import { container, injectable } from 'tsyringe';
import type { Mailer, SendProps } from './interfaces/mailer.interface';
import { ConfigService } from '../common/configs/config.service';
import nodemailer from 'nodemailer';

@injectable()
export class DevMailerService implements Mailer {
	private readonly transporter;
	constructor(private configService = container.resolve(ConfigService)) {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			host: 'smtp.gmail.com',
			port: 587,
			secure: false,
			auth: {
				user: this.configService.envs.GOOGLE_APP_EMAIL,
				pass: this.configService.envs.GOOGLE_APP_PASSWORD
			}
		});
	}

	async send({ to, template }: SendProps) {
		const info = await this.transporter.sendMail({
			from: process.env.EMAIL,
			to: to,
			subject: template.subject(),
			html: template.html()
		});
		console.dir(info);
	}
}
