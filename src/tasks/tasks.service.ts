import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task) private taskModel: typeof Task) {}
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.taskModel.create({ ...createTaskDto, userId });
    return task;
  }

  async findAll(userId: string) {
    return this.taskModel.findAll({ where: { userId } });
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.taskModel.findOne({
      where: { id: taskId, userId: userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(taskId: string, userId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(taskId, userId);
    const updatedTask = await task.update(updateTaskDto);
    return updatedTask;
  }

  async remove(taskId: string, userId: string) {
    const task = await this.findOne(taskId, userId);
    return task.destroy();
  }
}
