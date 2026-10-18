import { type TodoCompletedObserver, type TodoEntity } from '../../domain';

export class TodoCompletedNotifier implements TodoCompletedObserver {
	public update(todo: TodoEntity): void {
		console.log(`[NOTIFICATION] Todo ${todo.id} has been completed`);
	}
}