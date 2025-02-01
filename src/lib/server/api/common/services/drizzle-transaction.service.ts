import { injectable } from 'tsyringe';
import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';

@injectable()
export class DrizzleTransactionService extends DrizzleRepository {}
