import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsDate, // Date tipini import etdik
} from 'class-validator';
import { Priority, Status } from './create-task.dto'; // Status Enumunu import etdik

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

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

  // Yeni sahələr: Kanban və Timer üçün
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsDate() // DateTime tipini Date olaraq istifadə edirik
  startTime?: Date;

  @IsOptional()
  @IsDate() // DateTime tipini Date olaraq istifadə edirik
  endTime?: Date;

  @IsOptional()
  @IsNumber() // int tipini Number olaraq istifadə edirik (saniyə)
  totalTimeSpent?: number;
}
