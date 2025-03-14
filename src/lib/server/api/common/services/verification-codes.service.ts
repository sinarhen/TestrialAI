import { container, injectable } from 'tsyringe';
import { generateId } from '../utils/crypto';
import { HashingService } from './hashing.service';

@injectable()
export class VerificationCodesService {
	constructor(private hashingService = container.resolve(HashingService)) {}

	async generateCodeWithHash() {
		const verificationCode = this.generateCode();
		const hashedVerificationCode = await this.hashingService.hash(verificationCode);
		return { verificationCode, hashedVerificationCode };
	}

	verify(args: { verificationCode: string; hashedVerificationCode: string }) {
		return this.hashingService.compare(args.verificationCode, args.hashedVerificationCode);
	}

	private generateCode() {
		// alphabet with removed look-alike characters (0, 1, O, I)
		const alphabet = '23456789ACDEFGHJKLMNPQRSTUVWXYZ';
		// generate 6 character long random string
		return generateId(6, alphabet);
	}
}
