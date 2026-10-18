// src\features\todos\presentation\routes.ts

import { Router } from 'express';

import { TodoDatasourceImpl, TodoRepositoryImpl, TodoCompletedLogger, TodoCompletedNotifier } from '../infraestructure';
import { TodoController } from './controller';
import { AuthDatasourceImpl, AuthMiddleware, AuthRepositoryImpl } from '../../auth';
import { TodoCompletedEvent } from '../domain';

export class TodoRoutes {
	static get routes(): Router {
		const router = Router();

		//* This datasource can be change
		const datasource = new TodoDatasourceImpl();
		const repository = new TodoRepositoryImpl(datasource);

		const todoCompletedEvent = new TodoCompletedEvent();

		todoCompletedEvent.subscribe(new TodoCompletedLogger());
		todoCompletedEvent.subscribe(new TodoCompletedNotifier());

		const controller = new TodoController(repository, todoCompletedEvent);

		// * Authentication middleware
		const authDatasource = new AuthDatasourceImpl();
		const authRepository = new AuthRepositoryImpl(authDatasource);
		const authMiddleware = new AuthMiddleware(authRepository);

		router.get('/', controller.getAll);
		router.get('/:id', controller.getById);
		router.post('/', [authMiddleware.validateJWT], controller.create);
		router.put('/:id', controller.update);
		router.delete('/:id', controller.delete);

		// rest of operations
		// ...

		return router;
	}
}
