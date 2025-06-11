import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';

@UseGuards(JwtAuthGuard)
@Controller('subtasks')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateSubtaskDto) {
    const userId = req.user.id;
    return this.subtaskService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req, @Query('taskId', ParseIntPipe) taskId: number) {
    const userId = req.user.id;
    return this.subtaskService.findAll(userId, taskId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.subtaskService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubtaskDto,
  ) {
    const userId = req.user.id;
    return this.subtaskService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.subtaskService.remove(userId, id);
  }
}
