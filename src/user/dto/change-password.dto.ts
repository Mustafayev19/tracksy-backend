// src/user/dto/change-password.dto.ts

import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'Yeni parol minimum 6 simvol olmalıdır.' })
  newPassword: string;
}
