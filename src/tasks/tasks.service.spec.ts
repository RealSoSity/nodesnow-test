import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks/tasks.service';
import { getModelToken } from '@nestjs/sequelize';
import { Task } from './entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';

const userId = 'user-uuid-1234';

const expectedTask = {
  id: 'task-uuid-123',
  title: 'TaskTitle',
  description: 'TaskDescription',
  status: 'pending',
  userId: 'user-uuid-1234',
};

describe('TasksService', () => {
  let taskService: TasksService;
  const taskModel: Record<string, jest.Mock> = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task), useValue: taskModel },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  it('should create task when have a creating task request by a specific user', async () => {
    const mockCreateTaskDto: CreateTaskDto = {
      title: 'TaskTitle',
      description: 'TaskDescription',
      status: TaskStatus.PENDING,
    };

    taskModel.create.mockResolvedValue(expectedTask);

    const newTask = await taskService.create(mockCreateTaskDto, userId);

    expect(newTask).toEqual(expectedTask);
    expect(taskModel.create).toHaveBeenCalledWith({
      ...mockCreateTaskDto,
      userId,
    });
  });

  it('should return all tasks when find all tasks with userId', async () => {
    taskModel.findAll.mockResolvedValue(expectedTask);

    const results = await taskService.findAll(userId);

    expect(results).toEqual(expectedTask);
    expect(taskModel.findAll).toHaveBeenCalledWith({
      where: { userId: userId },
    });
  });

  it('should return specific task when provided taskId and userId', async () => {
    const taskId = 'task-uuid-123';
    taskModel.findOne.mockResolvedValue(expectedTask);

    const result = await taskService.findOne(taskId, userId);

    expect(result).toEqual(expectedTask);
    expect(taskModel.findOne).toHaveBeenCalledWith({
      where: { id: taskId, userId: userId },
    });
  });

  it('should throw NotFoundException when task not found', async () => {
    const taskId = 'invalid-uuid-134';
    taskModel.findOne.mockResolvedValue(null);

    await expect(taskService.findOne(taskId, userId)).rejects.toThrow(
      NotFoundException,
    );
    expect(taskModel.findOne).toHaveBeenCalledWith({
      where: { id: taskId, userId: userId },
    });
  });

  it('should update specific existing task when provide taskId', async () => {
    const taskId = 'task-uuid-123';

    const originalTask = {
      id: 'task-uuid-123',
      title: 'TaskTitle',
      description: 'TaskDescription',
      status: 'pending',
      userId: 'user-uuid-1234',
      update: jest.fn(),
    };

    const updatedTask = {
      id: 'task-uuid-123',
      title: 'UpdatedTaskTitle',
      description: 'UpdatedTaskDescription',
      status: 'in_progress',
      userId: 'user-uuid-1234',
    };

    const updatedTaskDto: UpdateTaskDto = {
      title: 'UpdatedTaskTitle',
      description: 'UpdatedTaskDescription',
      status: TaskStatus.IN_PROGRESS,
    };

    taskModel.findOne.mockResolvedValue(originalTask);
    originalTask.update.mockResolvedValue(updatedTask);

    const result = await taskService.update(taskId, userId, updatedTaskDto);

    expect(taskModel.findOne).toHaveBeenCalledWith({
      where: { id: taskId, userId: userId },
    });
    expect(originalTask.update).toHaveBeenCalledWith(updatedTaskDto);
    expect(result).toEqual(updatedTask);
  });

  it('should throw NotFoundException when task not found', async () => {
    const taskId = 'invalid-uuid-123';

    const updatedTaskDto: UpdateTaskDto = {
      title: 'UpdatedTaskTitle',
      description: 'UpdatedTaskDescription',
      status: TaskStatus.IN_PROGRESS,
    };

    taskModel.findOne.mockResolvedValue(null);

    await expect(
      taskService.update(taskId, userId, updatedTaskDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove task when provide taskId', async () => {
    const taskId = 'task-uuid-123';

    const originalTask = {
      id: 'task-uuid-123',
      title: 'TaskTitle',
      description: 'TaskDescription',
      status: 'pending',
      userId: 'user-uuid-1234',
      destroy: jest.fn(),
    };

    taskModel.findOne.mockResolvedValue(originalTask);
    originalTask.destroy.mockResolvedValue(undefined);

    const result = await taskService.remove(taskId, userId);

    expect(result).toBe(undefined);
    expect(originalTask.destroy).toHaveBeenCalled();
  });

  it('should throw NotFoundException when Task not found', async () => {
    const taskId = 'invalid-uuid-123';

    taskModel.findOne.mockResolvedValue(null);

    await expect(taskService.remove(taskId, userId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
