// update-subtask.dto.ts
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
