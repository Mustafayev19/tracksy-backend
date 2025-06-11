import { IsString, IsOptional, IsNotEmpty, IsHexColor } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
