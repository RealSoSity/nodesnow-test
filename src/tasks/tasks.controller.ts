import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create new task with Authenticated User' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Get all authenticated user tasks' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Get()
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.sub);
  }

  @ApiOperation({ summary: 'Get specific tasks by authenticated user' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed, specific field is required',
    schema: {
      example: {
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Task Not found',
    schema: {
      example: {
        message: 'Task not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) taskId: string, @Request() req) {
    return this.tasksService.findOne(taskId, req.user.sub);
  }

  @ApiOperation({
    summary: 'Update specific tasks detail by Authenticated user',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Task Not found',
    schema: {
      example: {
        message: 'Task not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) taskId: string,
    @Request() req,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, req.user.sub, updateTaskDto);
  }

  @ApiOperation({ summary: 'Remove specific tasks by authenticated user' })
  @ApiResponse({ status: 204, description: 'Task removed' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Invalid Token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Task Not found',
    schema: {
      example: {
        message: 'Task not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) taskId: string, @Request() req) {
    return this.tasksService.remove(taskId, req.user.sub);
  }
}
