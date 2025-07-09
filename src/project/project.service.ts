// src/project/project.service.ts (TAM DÜZƏLDİLMİŞ VƏ OPTİMALLAŞDIRILMIŞ)

// DÜZƏLİŞ: ForbiddenException silindi
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        // DÜZƏLİŞ: Təkrarlanan 'tasks' açarı silindi
        _count: {
          select: {
            tasks: true, // Yalnız ümumi tapşırıq sayını götürürük
          },
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      // DÜZƏLİŞ: Bu kod doğrudur, problem Prisma Client-in köhnə olmasındadır.
      // Generasiyadan sonra bu xətalar aradan qalxacaq.
      include: {
        tasks: {
          where: { parentId: null }, // Yalnız ana tapşırıqları seçirik
          include: {
            children: {
              // Uşaqların da uşaqlarını gətirmək üçün rekursiv include
              include: { children: true },
            },
          },
        },
      },
    });
    if (!project)
      throw new NotFoundException('Layihə tapılmadı və ya sizə aid deyil.');
    return project;
  }

  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        user: { connect: { id: userId } },
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateProjectDto) {
    const project = await this.prisma.project.updateMany({
      where: { id, userId },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });

    if (project.count === 0) {
      throw new NotFoundException(
        'Yeniləmək üçün layihə tapılmadı və ya sizə aid deyil.',
      );
    }
    return { message: 'Layihə uğurla yeniləndi.' };
  }

  async remove(id: number, userId: number) {
    const result = await this.prisma.project.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Silmək üçün layihə tapılmadı və ya sizə aid deyil.',
      );
    }
    // DÜZƏLİŞ: Silinmə uğurlu olduqda mesaj qaytarmaq daha yaxşıdır.
    return { message: 'Layihə uğurla silindi.' };
  }

  // Bu funksiyanı hələlik sadələşdiririk. Dərin statistikanı sonra əlavə edə bilərik.
  async getProjectStats(projectId: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Statistika üçün layihə tapılmadı.');
    }

    // `completedTasks` və `totalTimeSpent` üçün əlavə sorğu lazımdır.
    // Hələlik bunu sadə saxlayırıq.
    return {
      projectName: project.name,
      totalTasks: project._count.tasks,
      isCompleted: project.isCompleted,
    };
  }
}
