// src/user/user.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Delete,
  UseGuards,
  Req, // Req-i geri gətiririk, ancaq daha yaxşı üsulla
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';
import { RolesGuard } from 'src/auth/jwt.role.guard'; // Düzgün import
import { Roles } from 'src/auth/roles.decorator'; // Yeni dekorator
import { GetUser } from 'src/auth/get-user.decorator'; // Bizim custom dekorator

import { User } from 'generated/prisma';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // Bütün endpointlər üçün ümumi qoruma
export class UserController {
  constructor(private userService: UserService) {}

  // --- İSTİFADƏÇİ ÜÇÜN ENDPOINT-lər (`/me`) ---

  @Get('me')
  getProfile(@GetUser() user: User) {
    // GetUser dekoratoru sayəsində birbaşa istifadəçi obyektini alırıq
    // Servisə yalnız ID göndərmək kifayətdir
    return this.userService.findOne(user.id);
  }

  @Patch('me')
  updateProfile(@GetUser('id') userId: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  changePassword(
    @GetUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  // --- ADMİN ÜÇÜN ENDPOINT-lər ---

  @Get()
  @Roles('admin') // Yalnız adminlər üçün
  @UseGuards(RolesGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id/role')
  @Roles('admin')
  @UseGuards(RolesGuard)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.userService.updateRole(id, role);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
