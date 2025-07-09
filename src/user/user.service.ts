import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Köməkçi funksiya, cavabdan şifrəni silmək üçün.
   * @param user - Tam istifadəçi obyekti
   * @returns Şifrəsiz istifadəçi obyekti
   */
  private excludePassword(user: User) {
    const { password, ...result } = user;
    return result;
  }

  // --- ÜMUMİ VƏ İSTİFADƏÇİ ÜÇÜN METODLAR ---

  /**
   * Tək bir istifadəçini ID-sinə görə tapır və şifrəsiz qaytarır.
   * Həm admin, həm də istifadəçinin öz profilini görməsi üçün istifadə olunur.
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }
    return this.excludePassword(user);
  }

  /**
   * Hazırkı istifadəçinin profil məlumatlarını (ad, şəkil) yeniləyir.
   */
  async updateProfile(userId: number, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.excludePassword(updatedUser);
  }

  /**
   * Hazırkı istifadəçinin şifrəsini dəyişir.
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('İstifadəçi tapılmadı');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Köhnə şifrə yanlışdır.');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return { message: 'Şifrə uğurla dəyişdirildi.' };
  }

  // --- YALNIZ ADMİN ÜÇÜN METODLAR ---

  /**
   * Bütün istifadəçilərin siyahısını şifrəsiz qaytarır.
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.excludePassword(user));
  }

  /**
   * Admin tərəfindən bir istifadəçinin rolunu dəyişir.
   */
  async updateRole(id: number, role: string) {
    await this.findOne(id); // İstifadəçinin mövcudluğunu yoxlayır
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return this.excludePassword(updatedUser);
  }

  /**
   * Admin tərəfindən bir istifadəçini silir.
   */
  async remove(id: number) {
    await this.findOne(id); // İstifadəçinin mövcudluğunu yoxlayır
    await this.prisma.user.delete({ where: { id } });
    return { message: 'İstifadəçi uğurla silindi.' };
  }
}
