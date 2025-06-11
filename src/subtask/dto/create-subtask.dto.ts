// create-subtask.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsInt,
} from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsInt()
  taskId: number;
}
