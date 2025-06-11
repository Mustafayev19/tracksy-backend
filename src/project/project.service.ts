import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma servisi
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    return this.prisma.project.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateProjectDto) {
    return this.prisma.project.updateMany({
      where: { id, userId },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.project.deleteMany({
      where: { id, userId },
    });
  }
}
