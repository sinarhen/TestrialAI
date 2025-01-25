import { Container } from '@needle-di/core';
import { ApplicationModule } from './application.module';
import { ApplicationController } from './application.controller';

const applicationController = new Container().get(ApplicationController);
const applicationModule = new Container().get(ApplicationModule);

export function startServer() {
	return applicationModule.start();
}

export const routes = applicationController.registerControllers();

export type ApiRoutes = typeof routes;
