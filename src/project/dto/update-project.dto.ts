// src/project/dto/update-project.dto.ts

import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  MinLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // Və ya @nestjs/swagger əgər istifadə edirsinizsə
import { CreateProjectDto } from './create-project.dto'; // CreateProjectDto-dan miras alırıq

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Layihə adı minimum 3 simvol olmalıdır.' })
  name?: string;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Tamamlanma tarixi düzgün formatda olmalıdır (ISO-8601).' },
  )
  completedAt?: string | null;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Son icra tarixi düzgün formatda olmalıdır (YYYY-MM-DD).' },
  )
  deadline?: string | null;

  @IsOptional()
  @IsNumber()
  totalTimeSpent?: number | null;
}
