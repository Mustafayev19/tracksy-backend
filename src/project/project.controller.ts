// src/project/project.controller.ts (YENİLƏNMİŞ)

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard'; // Düzgün import yolu
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetUser } from 'src/auth/get-user.decorator'; // YENİ DEKORATORU İMPORT EDİRİK

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(@GetUser('id') userId: number) {
    // KOD DAHA TƏMİZ OLDU
    return this.projectService.findAll(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.projectService.findOne(id, userId);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @GetUser('id') userId: number) {
    return this.projectService.create(userId, dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @GetUser('id') userId: number,
  ) {
    return this.projectService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.projectService.remove(id, userId);
  }

  @Get(':id/stats')
  async getProjectStats(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.projectService.getProjectStats(id, userId);
  }
}
