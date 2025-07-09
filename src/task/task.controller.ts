// src/tasks/task.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'generated/prisma';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@GetUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(user.id, createTaskDto);
  }

  @Get()
  findAllByProject(
    @GetUser('id') userId: number,
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId?: number,
  ) {
    // projectId vacib olduğu üçün bu logikanı service-ə daşıyacağıq
    return this.taskService.findAllByProject(userId, projectId);
  }

  @Get(':id')
  findOne(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.findOne(userId, id);
  }

  @Patch('positions')
  updatePositions(
    @GetUser('id') userId: number,
    @Body() updates: UpdateTaskPositionDto[],
  ) {
    return this.taskService.updateTaskPositions(userId, updates);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(userId, id);
  }

  @Post(':id/start-timer')
  startTimer(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.startTaskTimer(userId, id);
  }

  @Post(':id/stop-timer')
  stopTimer(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.stopTaskTimer(userId, id);
  }
}
