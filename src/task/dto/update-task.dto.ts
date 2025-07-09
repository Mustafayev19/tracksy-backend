// FAYL: src/tasks/dto/update-task.dto.ts (DÜZƏLDİLMİŞ)

import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { TaskPriority, TaskStatus } from 'generated/prisma'; // Düzgün import yolu

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskPriority) // DÜZƏLİŞ: Düzgün Enum istifadə edildi
  priority?: TaskPriority;

  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsEnum(TaskStatus) // DÜZƏLİŞ: Düzgün Enum istifadə edildi
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  position?: number;

  // DÜZƏLİŞ: @IsDate -> @IsDateString olaraq dəyişdirildi
  @IsOptional()
  @IsDateString()
  startTime?: string;

  // DÜZƏLİŞ: @IsDate -> @IsDateString olaraq dəyişdirildi
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  totalTimeSpent?: number;
}
