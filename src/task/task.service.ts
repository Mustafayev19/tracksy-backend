import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'; // BadRequestException əlavə edildi
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, Status } from './dto/create-task.dto'; // Status Enumunu import etdik
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    // Yeni taskın pozisiyasını tapmaq
    // Ən sonuncu taskın pozisiyasından bir sonrakı dəyəri götürürük
    const lastTask = await this.prisma.task.findFirst({
      where: {
        userId,
        projectId: dto.projectId,
        status: dto.status ?? Status.TODO, // Yeni task default olaraq 'todo' statusunda olacaq
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (lastTask?.position ?? -1) + 1;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        notes: dto.notes,
        completed: dto.completed ?? false,
        dueDate: dto.dueDate,
        priority: dto.priority ?? 'medium',
        projectId: dto.projectId,
        userId: userId,
        status: dto.status ?? Status.TODO, // Yeni! Default status "todo"
        position: newPosition, // Yeni!
      },
    });
  }

  async findAll(userId: number, projectId?: number, status?: Status) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [
        // <--- Düzəliş burada! Massiv istifadə edin.
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        subtasks: true,
      },
    });
  }

  async findOne(
    userId: number,
    id: number,
  ): Promise<Task & { subtasks: any[] }> {
    // Return tipini dəyişdik
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: { subtasks: true }, // Subtaskları da gətir
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: number, id: number, dto: UpdateTaskDto) {
    await this.findOne(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        // Tarix stringlərini Date obyektinə çevir
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id); // Taskın user-ə aid olub olmadığını yoxla
    // Əvvəlcə əlaqəli subtaskları silin
    await this.prisma.subtask.deleteMany({
      where: { taskId: id },
    });

    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Yeni: Taskın timerini başla
  async startTaskTimer(userId: number, taskId: number): Promise<Task> {
    // `void` operatoru funksiyanın qaytardığı dəyəri göz ardı etməyimizi TypeScript-ə bildirir.
    // Bu, funksiyanın yan effektləri (məsələn, yoxlama və ya verilənlər bazası əməliyyatı) üçün nəzərdə tutulmuşdur.
    void (await this.findOne(userId, taskId));

    // Əvvəlcə bütün aktiv (startTime var, endTime yoxdur) task timerlərini dayandır
    // Bunu yalnız mövcud userin taskları üçün etmək lazımdır
    const activeTasks = await this.prisma.task.findMany({
      where: {
        userId,
        startTime: { not: null },
        endTime: null,
      },
    });

    for (const activeTask of activeTasks) {
      // Dəyişiklik burada başlayır
      if (activeTask.startTime !== null) {
        // Null yoxlaması əlavə edildi
        const duration = new Date().getTime() - activeTask.startTime.getTime(); // millisaniyə
        await this.prisma.task.update({
          where: { id: activeTask.id },
          data: {
            endTime: new Date(),
            totalTimeSpent:
              (activeTask.totalTimeSpent || 0) + Math.floor(duration / 1000), // saniyə
          },
        });
      }
      // Dəyişiklik burada bitir
    }

    // Cari taskın timerini başlat
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        startTime: new Date(),
        endTime: null, // Timer başladıqda bitmə vaxtı sıfırlanır
      },
    });
  }

  // Yeni: Taskın timerini dayandır
  async stopTaskTimer(userId: number, taskId: number): Promise<Task> {
    const task = await this.findOne(userId, taskId);

    if (!task.startTime || task.endTime) {
      // Əgər timer başlamayıbsa və ya artıq bitibsə, xəta qaytar
      throw new BadRequestException(
        'Task timer not active or already stopped.',
      );
    }

    const duration = new Date().getTime() - task.startTime.getTime(); // millisaniyə
    const newTotalTimeSpent =
      (task.totalTimeSpent || 0) + Math.floor(duration / 1000); // saniyə

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        endTime: new Date(),
        totalTimeSpent: newTotalTimeSpent,
      },
    });
  }

  // Yeni: Taskların pozisiyalarını güncəlləmək üçün metod (Kanban üçün)
  async updateTaskPositions(
    userId: number,
    updates: { id: number; position: number; status: Status }[],
  ): Promise<Task[]> {
    const updatedTasks: Task[] = [];
    for (const update of updates) {
      // Yoxlayın ki, task istifadəçiyə aiddir
      await this.findOne(userId, update.id);
      const updatedTask = await this.prisma.task.update({
        where: { id: update.id },
        data: {
          position: update.position,
          status: update.status,
        },
      });
      updatedTasks.push(updatedTask);
    }
    return updatedTasks;
  }
}
