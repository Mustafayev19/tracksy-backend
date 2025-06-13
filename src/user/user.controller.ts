import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Delete,
  UseGuards,
  Req,
  UsePipes, // DÜZƏLİŞ: UsePipes import edildi
  ValidationPipe,
  UnauthorizedException, // DÜZƏLİŞ: ValidationPipe import edildi
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt.aut.guard';
import { RolesGuard } from 'src/auth/jwt.role.guard';
import { ChangePasswordDto } from './dto/change-password.dto'; // DÜZƏLİŞ: ChangePasswordDto import edildi

@UseGuards(JwtAuthGuard) // Bütün user routeları üçün JWT AuthGuard
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(new RolesGuard(['admin'])) // Sadəcə adminlər bütün userləri görə bilər
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id/role')
  @UseGuards(new RolesGuard(['admin'])) // Sadəcə adminlər rol dəyişdirə bilər
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    return this.userService.updateRole(id, role);
  }

  @Delete(':id')
  @UseGuards(new RolesGuard(['admin'])) // Sadəcə adminlər user silə bilər
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  /**
   * İstifadəçinin parolunu dəyişdirmək üçün endpoint.
   * İstifadəçi yalnız öz parolu dəyişdirə bilər.
   */
  @Patch(':id/change-password')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true })) // DTO validasiyası
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Req() req, // Request obyektinə daxil olmaq üçün
    @Body() dto: ChangePasswordDto, // Yeni DTO
  ) {
    // DÜZƏLİŞ: İstifadəçinin yalnız öz parolu dəyişdirə bilməsini təmin edin
    if (req.user.id !== id) {
      throw new UnauthorizedException(
        'Yalnız öz parolunuzu dəyişdirə bilərsiniz.',
      );
    }
    return this.userService.changePassword(id, dto);
  }
}
