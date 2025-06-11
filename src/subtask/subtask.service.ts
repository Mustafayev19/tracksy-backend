import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSubtaskDto) {
    return this.prisma.subtask.create({
      data: {
        title: dto.title,
        completed: dto.completed ?? false,
        taskId: dto.taskId,
      },
    });
  }

  async findAll(userId: number, taskId: number) {
    return this.prisma.subtask.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const subtask = await this.prisma.subtask.findFirst({
      where: { id },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');
    return subtask;
  }

  async update(userId: number, id: number, dto: UpdateSubtaskDto) {
    await this.findOne(userId, id);
    return this.prisma.subtask.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.subtask.delete({
      where: { id },
    });
  }
}
