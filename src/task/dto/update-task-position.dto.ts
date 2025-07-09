// FAYL: src/tasks/dto/update-task-position.dto.ts (DÜZƏLDİLMİŞ)

import { IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
// DÜZƏLİŞ: TaskStatus enum-unu düzgün yoldan import edirik
import { TaskStatus } from 'generated/prisma';

export class UpdateTaskPositionDto {
  @Type(() => Number)
  @IsNumber()
  id: number;

  @Type(() => Number)
  @IsNumber()
  position: number;

  // DÜZƏLİŞ: @IsEnum dekoratorunun içərisinə Enum-un özü yazılır
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
