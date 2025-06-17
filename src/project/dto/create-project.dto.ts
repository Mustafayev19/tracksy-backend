// src/project/dto/create-project.dto.ts

import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(3, { message: 'Layihə adı minimum 3 simvol olmalıdır.' })
  name: string;

  @IsOptional()
  @IsString()
  color?: string | null; // DÜZƏLİŞ: `| null` əlavə edildi

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Son icra tarixi düzgün formatda olmalıdır (YYYY-MM-DD).' },
  )
  deadline?: string | null;
}
