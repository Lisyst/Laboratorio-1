import { type TodoEntity } from '../entities';

export interface TodoCompletedObserver {
    update(todo: TodoEntity): void;
}

export class TodoCompletedEvent {
    private readonly observers: TodoCompletedObserver[] = [];

    public subscribe(observer: TodoCompletedObserver): void {
        this.observers.push(observer);
    }

    public notify(todo: TodoEntity): void {
        this.observers.forEach((observer) => observer.update(todo));
    }
}