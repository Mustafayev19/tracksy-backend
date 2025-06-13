import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.id;
    return this.projectService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.projectService.findOne(id, userId);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @Req() req) {
    const userId = req.user.id;
    return this.projectService.create(userId, dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.projectService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.projectService.remove(id, userId);
  }

  /**
   * Layihə statistikalarını qaytaran yeni endpoint.
   * GET /projects/:id/stats
   */
  @Get(':id/stats')
  async getProjectStats(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const userId = req.user.id;
    return this.projectService.getProjectStats(id, userId);
  }
}
