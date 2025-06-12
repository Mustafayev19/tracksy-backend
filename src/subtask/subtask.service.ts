import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Status } from 'src/task/dto/create-task.dto';

@Injectable()
export class SubtaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSubtaskDto) {
    const newSubtask = await this.prisma.subtask.create({
      // Subtaskı yaradırıq
      data: {
        title: dto.title,
        completed: dto.completed ?? false,
        taskId: dto.taskId,
      },
    });

    // Subtask yaradıldıqdan sonra əsas taskın vəziyyətini yoxla
    // Bu, əsasən taskın completed statusunu idarə edir.
    await this.updateMainTaskCompletionStatus(newSubtask.taskId);

    return newSubtask;
  }

  async findAll(userId: number, taskId: number) {
    // Təhlükəsizlik yoxlaması: Taskın istifadəçiyə aid olub olmadığını yoxla
    // Bunun üçün Task modelinə ehtiyac var.
    const task = await this.prisma.task.findUnique({
      where: { id: taskId, userId: userId },
      select: { id: true }, // Yalnız id kifayətdir
    });

    if (!task) {
      throw new NotFoundException('Task not found for this user.');
    }

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
      include: { task: { select: { userId: true } } }, // Subtaskın aid olduğu taskın userId-ni gətir
    });
    if (!subtask || subtask.task.userId !== userId) {
      // Təhlükəsizlik yoxlaması
      throw new NotFoundException('Subtask not found or not owned by user');
    }
    return subtask;
  }

  async update(userId: number, id: number, dto: UpdateSubtaskDto) {
    // Öncə subtaskın userə aid olduğunu yoxla
    const existingSubtask = await this.findOne(userId, id);

    const updatedSubtask = await this.prisma.subtask.update({
      where: { id },
      data: dto,
    });

    // DÜZƏLİŞ: Subtask güncəlləndikdən sonra əsas taskın tamamlanma vəziyyətini yoxla
    await this.updateMainTaskCompletionStatus(existingSubtask.taskId);

    return updatedSubtask;
  }

  async remove(userId: number, id: number) {
    // Öncə subtaskın userə aid olduğunu yoxla
    const existingSubtask = await this.findOne(userId, id);

    const deletedSubtask = await this.prisma.subtask.delete({
      where: { id },
    });

    // DÜZƏLİŞ: Subtask silindikdən sonra əsas taskın tamamlanma vəziyyətini yoxla
    await this.updateMainTaskCompletionStatus(existingSubtask.taskId);

    return deletedSubtask;
  }

  // DÜZƏLİŞ: Yeni köməkçi metod - Əsas taskın tamamlanma statusunu güncəlləyir
  private async updateMainTaskCompletionStatus(taskId: number): Promise<void> {
    const mainTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { subtasks: true },
    });

    if (mainTask) {
      const allSubtasksCompleted = mainTask.subtasks.every(
        (st) => st.completed,
      );

      // Əsas taskın cari statusunu da yoxlamaq lazımdır ki, lazımsız update edilməsin
      const currentTaskStatus = mainTask.status as Status;
      const currentTaskCompleted = mainTask.completed;

      let shouldUpdateTask = false;
      let newCompletedStatus = currentTaskCompleted;
      let newStatus: Status = currentTaskStatus;

      // Əgər bütün alt-tasklar tamamlanıbsa VƏ əsas task hələ tamamlanmayıbsa
      if (allSubtasksCompleted && !currentTaskCompleted) {
        newCompletedStatus = true;
        newStatus = Status.DONE;
        shouldUpdateTask = true;
      }
      // Əgər bütün alt-tasklar tamamlanmayıbsa VƏ əsas task tamamlanmışdısa
      else if (!allSubtasksCompleted && currentTaskCompleted) {
        newCompletedStatus = false;
        // Əgər task "Done" idisə, onu "In Progress" və ya "Todo" edə bilərik
        newStatus = Status.IN_PROGRESS; // Veya Status.TODO, bu UX qərarıdır
        shouldUpdateTask = true;
      }

      if (shouldUpdateTask) {
        await this.prisma.task.update({
          where: { id: mainTask.id },
          data: {
            completed: newCompletedStatus,
            status: newStatus,
          },
        });
      }
    }
  }
}
