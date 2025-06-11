import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
