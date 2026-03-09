import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtService } from '@nestjs/jwt';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException } from '@nestjs/common';

const mockTaskService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockExpectTask = {
  id: 'task-uuid-1234',
  title: 'TaskTitle',
  description: 'TaskDescription',
  status: 'pending',
  userId: 'user-uuid-123',
};

const mockCreateTaskDto: CreateTaskDto = {
  title: 'TaskTitle',
  description: 'TaskDescription',
  status: TaskStatus.PENDING,
};

const mockRequest = {
  user: {
    sub: 'user-uuid-123',
  },
};

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: Record<string, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTaskService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tasksController).toBeDefined();
  });

  it('should call TasksService create function when requests create Task', async () => {
    tasksService.create.mockResolvedValue(mockExpectTask);

    const result = await tasksController.create(mockCreateTaskDto, mockRequest);

    expect(result).toEqual(mockExpectTask);
  });

  it('should call TaskService findAll function when requests with GET', async () => {
    tasksService.findAll.mockResolvedValue(mockExpectTask);

    const results = await tasksController.findAll(mockRequest);

    expect(results).toEqual(mockExpectTask);
  });

  it('should call TasksService findOne function if requests GET with TaskId', async () => {
    const mockTaskId = 'task-uuid-1234';
    tasksService.findOne.mockResolvedValue(mockExpectTask);

    const result = await tasksController.findOne(mockTaskId, mockRequest);

    expect(result).toEqual(mockExpectTask);
    expect(tasksService.findOne).toHaveBeenCalledWith(
      mockTaskId,
      mockRequest.user.sub,
    );
  });

  it('should throw NotFoundException when task not found', async () => {
    const mockInvalidTaskId = 'invalid-uuid-134';
    tasksService.findOne.mockRejectedValue(
      new NotFoundException('Task not found'),
    );

    await expect(
      tasksController.findOne(mockInvalidTaskId, mockRequest),
    ).rejects.toThrow(NotFoundException);
  });

  it('should call TasksService update when requests with PATCH', async () => {
    const updateTaskId = 'task-uuid-1234';
    const updateTaskDto: UpdateTaskDto = {
      description: 'NewTaskDescription',
    };

    const expectUpdatedTask = {
      id: updateTaskId,
      title: mockExpectTask.title,
      description: 'NewTaskDescription',
      status: TaskStatus.PENDING,
      userId: mockExpectTask.userId,
    };
    tasksService.update.mockResolvedValue(expectUpdatedTask);

    const result = await tasksController.update(
      updateTaskId,
      mockRequest,
      updateTaskDto,
    );

    expect(result).toEqual(expectUpdatedTask);
    expect(tasksService.update).toHaveBeenCalledWith(
      updateTaskId,
      mockRequest.user.sub,
      updateTaskDto,
    );
  });

  it('should call TasksService remove function when requests DELETE with TaskId', async () => {
    const mockRemoveTaskId = 'task-uuid-1234';
    tasksService.remove.mockResolvedValue(undefined);

    const result = await tasksController.remove(mockRemoveTaskId, mockRequest);

    expect(result).toBe(undefined);

    expect(tasksService.remove).toHaveBeenCalledWith(
      mockRemoveTaskId,
      mockRequest.user.sub,
    );
  });
});
