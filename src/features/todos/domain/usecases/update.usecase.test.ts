import { UpdateTodoDto } from '../dtos';
import { TodoEntity } from '../entities';
import { TodoCompletedEvent, TodoCompletedObserver } from '../observers';
import { TodoRepository } from '../repositories/respository';
import { UpdateTodo, UpdateTodoUseCase } from './update.usecase';

describe('tests in update.usecase.ts', () => {
	let repository: jest.Mocked<TodoRepository>;
	let updateTodoUseCase: UpdateTodoUseCase;
	let todoCompletedEvent: TodoCompletedEvent;
	let observer: jest.Mocked<TodoCompletedObserver>;

	beforeEach(() => {
		repository = {
			create: jest.fn(),
			getAll: jest.fn(),
			getById: jest.fn(),
			update: jest.fn(),
			delete: jest.fn()
		} as jest.Mocked<TodoRepository>;

		observer = {
			update: jest.fn()
		};

		todoCompletedEvent = new TodoCompletedEvent();
		todoCompletedEvent.subscribe(observer);

		updateTodoUseCase = new UpdateTodo(repository, todoCompletedEvent);
	});

	test('should update a todo item successfully', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			text: 'Test Todo updated'
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', false);
		const updatedTodo = new TodoEntity(1, 'Test Todo updated', false);

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockResolvedValue(updatedTodo);

		const result = await updateTodoUseCase.execute(updateData);

		expect(repository.getById).toHaveBeenCalled();
		expect(repository.update).toHaveBeenCalledWith(updateData);
		expect(result).toEqual(updatedTodo);
	});

	test('should notify observers when todo changes from incomplete to completed', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			isCompleted: true
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', false);
		const updatedTodo = new TodoEntity(1, 'Test Todo', true);

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockResolvedValue(updatedTodo);

		await updateTodoUseCase.execute(updateData);

		expect(observer.update).toHaveBeenCalledTimes(1);
		expect(observer.update).toHaveBeenCalledWith(updatedTodo);
	});

	test('should not notify observers when todo remains incomplete', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			text: 'Updated text'
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', false);
		const updatedTodo = new TodoEntity(1, 'Updated text', false);

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockResolvedValue(updatedTodo);

		await updateTodoUseCase.execute(updateData);

		expect(observer.update).not.toHaveBeenCalled();
	});

	test('should not notify observers when todo was already completed', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			isCompleted: true
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', true);
		const updatedTodo = new TodoEntity(1, 'Test Todo', true);

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockResolvedValue(updatedTodo);

		await updateTodoUseCase.execute(updateData);

		expect(observer.update).not.toHaveBeenCalled();
	});

	test('should not notify observers when todo changes from completed to incomplete', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			isCompleted: false
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', true);
		const updatedTodo = new TodoEntity(1, 'Test Todo', false);

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockResolvedValue(updatedTodo);

		await updateTodoUseCase.execute(updateData);

		expect(observer.update).not.toHaveBeenCalled();
	});

	test('should throw an error if repository.update fails', async () => {
		const updateData = UpdateTodoDto.create({
			id: 1,
			text: 'Test Todo updated'
		});

		const previousTodo = new TodoEntity(1, 'Test Todo', false);
		const error = new Error('Repository update failed');

		repository.getById.mockResolvedValue(previousTodo);
		repository.update.mockRejectedValue(error);

		await expect(updateTodoUseCase.execute(updateData)).rejects.toThrow(error);
	});
});