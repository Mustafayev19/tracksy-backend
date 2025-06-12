import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';

// Yeni: Taskın statusunu göstərmək üçün Enum
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Yeni: Taskın statusunu göstərmək üçün Enum (Kanban Board üçün)
export enum Status {
  TODO = 'todo', // Ediləcək
  IN_PROGRESS = 'inProgress', // İşdə
  DONE = 'done', // Tamamlandı
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsNumber()
  projectId?: number;

  // Yeni: Taskın statusu
  @IsOptional()
  @IsEnum(Status)
  status?: Status; // Default dəyər Prisma modelində olacağı üçün burada IsOptional qaldı

  // Yeni: Taskın sütun daxilindəki mövqeyi
  @IsOptional()
  @IsNumber()
  position?: number; // Optional, çünki frontend tərəfindən idarə oluna bilər
}
