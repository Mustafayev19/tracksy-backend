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
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Req() req, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(@Req() req, @Query('projectId') projectId?: string) {
    const pid = projectId ? parseInt(projectId) : undefined;
    return this.taskService.findAll(req.user.id, pid);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.taskService.findOne(req.user.id, parseInt(id));
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(req.user.id, parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.taskService.remove(req.user.id, parseInt(id));
  }
}
