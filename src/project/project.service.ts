import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from 'generated/prisma';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(userId: number, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        ...dto,
        userId,
        isCompleted: false,
        totalTimeSpent: 0,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined, // DÜZƏLİŞ: Deadline Date obyektinə çevrilir
      },
    });
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    await this.findOne(id, userId);
    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined, // DÜZƏLİŞ: Deadline Date obyektinə çevrilir
      },
    });
    return updatedProject;
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);
    await this.prisma.project.delete({
      where: { id },
    });
  }

  async getProjectStats(
    projectId: number,
    userId: number,
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalTimeSpent: number;
    isCompleted: boolean;
    completedAt: Date | null;
    projectName: string;
  }> {
    const project = await this.findOne(projectId, userId);

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
      newIsCompletedStatus = true;
      newCompletedAt = new Date();
      shouldUpdateProject = true;
    } else if (!allTasksCompleted && project.isCompleted) {
      newIsCompletedStatus = false;
      newCompletedAt = null;
      shouldUpdateProject = true;
    }

    if (project.totalTimeSpent !== currentProjectTotalTimeSpent) {
      shouldUpdateProject = true;
    }

    if (shouldUpdateProject) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          isCompleted: newIsCompletedStatus,
          completedAt: newCompletedAt,
          totalTimeSpent: currentProjectTotalTimeSpent,
        },
      });
    }
  }
}
