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
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, Status } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { plainToInstance } from 'class-transformer';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ** YENİ SIRALAMA STRATEGIYASI: Sabit routelar əvvəldə, parametrik routelar sonra **

  @Patch('positions') // PATCH /tasks/positions (Sabit route)
  // DÜZƏLİŞ: `ValidationPipe` yenidən əlavə edildi
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  updatePositions(
    @Req() req,
    @Body() rawUpdates: any[], // Raw data olaraq `any[]` qəbul edirik
  ) {
    // `plainToInstance` ilə datanı DTO massivinə çeviririk
    // Qeyd: Yuxarıdakı @UsePipes sayəsində `transform` aktiv olacaq,
    // lakin `plainToInstance` metodunu açıq şəkildə saxlamaq daha təhlükəsizdir,
    // çünki bu, rəqəm çevrilməsini təmin edir.
    const transformedUpdates: UpdateTaskPositionDto[] = rawUpdates.map(
      (item) => {
        const dto = plainToInstance(UpdateTaskPositionDto, item);
        return {
          id: Number(dto.id),
          position: Number(dto.position),
          status: dto.status,
        } as UpdateTaskPositionDto;
      },
    );

    return this.taskService.updateTaskPositions(
      req.user.id,
      transformedUpdates,
    );
  }

  @Post() // <-- POST /tasks (Sabit route)
  create(@Req() req, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(req.user.id, createTaskDto);
  }

  @Get() // <-- GET /tasks (Sabit route)
  findAll(
    @Req() req,
    @Query('projectId') projectId?: string,
    @Query('status') status?: Status,
  ) {
    const pid = projectId ? parseInt(projectId) : undefined;
    return this.taskService.findAll(req.user.id, pid, status);
  }

  @Post(':id/start-timer') // <-- POST /tasks/:id/start-timer (Sabit string olan parametrik route)
  startTimer(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.startTaskTimer(req.user.id, id);
  }

  @Post(':id/stop-timer') // <-- POST /tasks/:id/stop-timer (Sabit string olan parametrik route)
  stopTimer(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.stopTaskTimer(req.user.id, id);
  }

  // --- PARAMETRİK (DYNAMIC) ROUTELAR BURADAN SONRA GELİR ---

  @Get(':id') // <-- GET /tasks/:id (Parametrik route)
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(req.user.id, id);
  }

  @Patch(':id') // <-- PATCH /tasks/:id (Parametrik route)
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(req.user.id, id, dto);
  }

  @Delete(':id') // <-- DELETE /tasks/:id (Parametrik route)
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(req.user.id, id);
  }
}
