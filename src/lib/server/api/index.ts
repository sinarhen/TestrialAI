import { container } from 'tsyringe';
import { ApplicationModule } from './application.module';
import { ApplicationController } from './application.controller';

const applicationController = container.resolve(ApplicationController);
const applicationModule = container.resolve(ApplicationModule);

export function startServer() {
	return applicationModule.start();
}

export const routes = applicationController.registerControllers();
export type ApiRoutes = typeof routes;
