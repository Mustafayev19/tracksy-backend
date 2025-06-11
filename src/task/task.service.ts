import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        notes: dto.notes,
        completed: dto.completed ?? false,
        dueDate: dto.dueDate,
        priority: dto.priority ?? 'medium',
        projectId: dto.projectId,
        userId: userId,
      },
    });
  }

  async findAll(userId: number, projectId?: number) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: number, id: number, dto: UpdateTaskDto) {
    await this.findOne(userId, id); // yoxlayırıq ki, task user-ə aiddirmi
    return this.prisma.task.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
