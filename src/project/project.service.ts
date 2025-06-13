import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from 'generated/prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  /**
   * Bütün layihələri istifadəçi ID-sinə görə qaytarır.
   * Layihələrə aid statistik məlumatları daxil edir (lakin bu metod üçün yox, yeni bir metod üçün).
   */
  async findAll(userId: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      // `include` burada lazım deyil, çünki statistikaları ayrıca metoddan alacağıq
    });
  }

  /**
   * Müəyyən bir layihəni ID və istifadəçi ID-sinə görə qaytarır.
   */
  async findOne(id: number, userId: number): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  /**
   * Yeni layihə yaradır.
   */
  async create(userId: number, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...dto,
        userId,
        isCompleted: false, // Yeni yaradılan layihə default olaraq tamamlanmamışdır
        totalTimeSpent: 0, // Yeni yaradılan layihənin sərf olunan vaxtı 0-dır
      },
    });
  }

  /**
   * Layihəni güncəlləyir.
   */
  async update(
    id: number,
    userId: number,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    // Layihənin istifadəçiyə aid olduğunu yoxla
    await this.findOne(id, userId);
    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: dto,
    });
    return updatedProject;
  }

  /**
   * Layihəni silir. ON DELETE CASCADE sayəsində əlaqəli tasklar və subtasklar da silinir.
   */
  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId); // Layihənin istifadəçiyə aid olduğunu yoxla
    await this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Layihəyə aid statistik məlumatları qaytarır:
   * - Ümumi task sayı
   * - Tamamlanmış task sayı
   * - Layihəyə sərf olunan ümumi vaxt
   */
  async getProjectStats(
    projectId: number,
    userId: number,
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalTimeSpent: number; // Saniyə
    isCompleted: boolean;
    completedAt: Date | null;
    projectName: string;
  }> {
    const project = await this.findOne(projectId, userId); // Layihənin mövcudluğunu və aidiyyatını yoxla

    const tasks = await this.prisma.task.findMany({
      where: { projectId: projectId },
      select: {
        completed: true,
        totalTimeSpent: true,
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTimeSpent = tasks.reduce(
      (sum, task) => sum + (task.totalTimeSpent || 0),
      0,
    );

    return {
      totalTasks,
      completedTasks,
      totalTimeSpent,
      isCompleted: project.isCompleted,
      completedAt: project.completedAt,
      projectName: project.name,
    };
  }

  /**
   * Layihənin bütün taskları tamamlandıqda layihənin statusunu yeniləyir.
   * Bu metod TaskService-dən çağırılacaq.
   */
  async updateProjectCompletionStatus(projectId: number): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { select: { completed: true, totalTimeSpent: true } } },
    });

    if (!project) return;

    const allTasksCompleted = project.tasks.every((task) => task.completed);
    const currentProjectTotalTimeSpent = project.tasks.reduce(
      (sum, task) => sum + (task.totalTimeSpent || 0),
      0,
    );

    let shouldUpdateProject = false;
    let newIsCompletedStatus = project.isCompleted;
    let newCompletedAt: Date | null = project.completedAt;

    if (allTasksCompleted && !project.isCompleted) {
      // Bütün tasklar tamamlandı VƏ layihə hələ tamamlanmayıbsa
      newIsCompletedStatus = true;
      newCompletedAt = new Date(); // Tamamlanma vaxtını qeyd et
      shouldUpdateProject = true;
    } else if (!allTasksCompleted && project.isCompleted) {
      // Bütün tasklar tamamlanmadı VƏ layihə tamamlanmışdısa (geri alındı)
      newIsCompletedStatus = false;
      newCompletedAt = null; // Tamamlanma vaxtını sıfırla
      shouldUpdateProject = true;
    }

    // Layihənin totalTimeSpent-ni də yenilə (tasklar dəyişəndə)
    if (project.totalTimeSpent !== currentProjectTotalTimeSpent) {
      shouldUpdateProject = true;
    }

    if (shouldUpdateProject) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          isCompleted: newIsCompletedStatus,
          completedAt: newCompletedAt,
          totalTimeSpent: currentProjectTotalTimeSpent, // Total vaxtı yenilə
        },
      });
    }
  }
}
