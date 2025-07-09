// FAYL: src/tasks/dto/create-task.dto.ts (DÜZƏLDİLMİŞ)

import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
// DÜZƏLİŞ: İmport yolu nisbi olaraq düzəldildi
import { TaskPriority, TaskStatus } from 'generated/prisma';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsNumber()
  projectId: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
