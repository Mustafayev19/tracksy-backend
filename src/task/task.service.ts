import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { Task, TaskStatus } from 'generated/prisma';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto): Promise<Task> {
    const { projectId, parentId, ...rest } = dto;

    await this.verifyProjectOwnership(projectId, userId);

    if (parentId) {
      await this.verifyTaskOwnership(parentId, userId);
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { projectId, parentId: parentId ?? null },
      orderBy: { position: 'desc' },
    });
    const newPosition = (lastTask?.position ?? -1) + 1;

    return this.prisma.task.create({
      data: {
        ...rest,
        position: newPosition,
        status: dto.status || TaskStatus.TODO,
        project: { connect: { id: projectId } },
        user: { connect: { id: userId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  async findAllByProject(userId: number, projectId?: number) {
    if (!projectId) {
      throw new BadRequestException(
        'Layihə ID-si göndərilməlidir (projectId).',
      );
    }
    await this.verifyProjectOwnership(projectId, userId);

    // Bütün tapşırıq ağacını gətiririk
    return this.prisma.task.findMany({
      where: { userId, projectId, parentId: null }, // Yalnız ana tapşırıqları gətiririk
      orderBy: { position: 'asc' },
      include: {
        children: {
          // 1-ci səviyyə alt-tapşırıqlar
          orderBy: { position: 'asc' },
          include: {
            children: { orderBy: { position: 'asc' } }, // 2-ci səviyyə alt-tapşırıqlar
          },
        },
      },
    });
  }

  async findOne(userId: number, taskId: number): Promise<Task> {
    return this.verifyTaskOwnership(taskId, userId);
  }

  async update(
    userId: number,
    taskId: number,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    await this.verifyTaskOwnership(taskId, userId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: number, taskId: number) {
    await this.verifyTaskOwnership(taskId, userId);
    try {
      await this.prisma.task.delete({ where: { id: taskId } });
      return { message: 'Tapşırıq uğurla silindi.' };
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Bu tapşırığı silməmişdən əvvəl onun alt-tapşırıqlarını silməlisiniz.',
        );
      }
      throw error;
    }
  }

  async updateTaskPositions(userId: number, updates: UpdateTaskPositionDto[]) {
    if (!updates || updates.length === 0)
      return { message: 'Yenilənəcək məlumat yoxdur.' };

    const transactions = updates.map((update) =>
      this.prisma.task.updateMany({
        where: { id: update.id, userId },
        data: { position: update.position, status: update.status },
      }),
    );

    await this.prisma.$transaction(transactions);
    return { message: 'Pozisiyalar uğurla yeniləndi.' };
  }

  async startTaskTimer(userId: number, taskId: number): Promise<Task> {
    await this.verifyTaskOwnership(taskId, userId);

    const runningTask = await this.prisma.task.findFirst({
      where: { userId, startTime: { not: null }, endTime: null },
    });

    if (runningTask && runningTask.id !== taskId) {
      await this.stopTaskTimer(userId, runningTask.id);
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { startTime: new Date(), endTime: null },
    });
  }

  async stopTaskTimer(userId: number, taskId: number): Promise<Task> {
    const task = await this.verifyTaskOwnership(taskId, userId);

    if (!task.startTime) {
      return task;
    }

    const duration = new Date().getTime() - task.startTime.getTime();
    const newTotalTimeSpent =
      (task.totalTimeSpent || 0) + Math.round(duration / 1000);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        endTime: new Date(),
        startTime: null,
        totalTimeSpent: newTotalTimeSpent,
      },
    });
  }

  private async verifyProjectOwnership(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new NotFoundException('Layihə tapılmadı və ya sizə aid deyil.');
    }
  }

  private async verifyTaskOwnership(
    taskId: number,
    userId: number,
  ): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      throw new NotFoundException('Tapşırıq tapılmadı və ya sizə aid deyil.');
    }
    return task;
  }
}
