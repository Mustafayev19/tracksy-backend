// src/auth/dto/register.dto.ts
import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail() // <--- Əmin olun ki, bu var
  email: string; // <--- Və bu optional deyil

  @IsString()
  password: string;

  @IsOptional()
  @IsUrl() // Əgər URL validasiyası istəyirsinizsə
  profileImageUrl?: string;
}
