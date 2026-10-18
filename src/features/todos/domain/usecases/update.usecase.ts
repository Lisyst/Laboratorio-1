import { GetTodoByIdDto, type UpdateTodoDto } from '../dtos';
import { type TodoEntity } from '../entities';
import { type TodoCompletedEvent } from '../observers';
import { type TodoRepository } from '../repositories/respository';

export interface UpdateTodoUseCase {
	execute: (data: UpdateTodoDto) => Promise<TodoEntity>;
}

export class UpdateTodo implements UpdateTodoUseCase {
	constructor(
		private readonly repository: TodoRepository,
		private readonly todoCompletedEvent: TodoCompletedEvent
	) {}

	async execute(data: UpdateTodoDto): Promise<TodoEntity> {
		const getTodoByIdDto = GetTodoByIdDto.create({ id: data.id });
		const previousTodo = await this.repository.getById(getTodoByIdDto);

		const updatedTodo = await this.repository.update(data);

		const wasCompleted = previousTodo.isCompleted;
		const isCompleted = updatedTodo.isCompleted;

		if (!wasCompleted && isCompleted) {
			this.todoCompletedEvent.notify(updatedTodo);
		}

		return updatedTodo;
	}
}