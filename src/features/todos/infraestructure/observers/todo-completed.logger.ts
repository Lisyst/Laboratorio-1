import { type TodoCompletedObserver, type TodoEntity } from '../../domain';

export class TodoCompletedLogger implements TodoCompletedObserver {
    public update(todo: TodoEntity): void {
        console.log(`[TODO COMPLETED] Todo ${todo.id}: ${todo.text}`);
    }
}