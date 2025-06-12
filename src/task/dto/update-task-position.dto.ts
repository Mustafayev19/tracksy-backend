// src/tasks/dto/update-task-position.dto.ts
import { IsNumber, IsEnum } from 'class-validator'; // Geri qaytarıldı
import { Status } from './create-task.dto';
import { Type } from 'class-transformer'; // <--- Geri qaytarıldı

export class UpdateTaskPositionDto {
  @Type(() => Number) // <--- Geri qaytarıldı
  @IsNumber() // <--- Geri qaytarıldı
  id: number;

  @Type(() => Number) // <--- Geri qaytarıldı
  @IsNumber() // <--- Geri qaytarıldı
  position: number;

  @IsEnum(Status) // <--- Geri qaytarıldı
  status: Status; // <--- string yerinə Status olaraq qalır
}
