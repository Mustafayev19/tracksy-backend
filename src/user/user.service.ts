import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'; // DÜZƏLİŞ: BadRequestException, UnauthorizedException import edildi
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'; // DÜZƏLİŞ: bcrypt import edildi
import { ChangePasswordDto } from './dto/change-password.dto'; // DÜZƏLİŞ: ChangePasswordDto import edildi
import { User } from 'generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profileImageUrl: true,
      }, // DÜZƏLİŞ: name və profileImageUrl əlavə edildi
    });
  }

  async findOne(id: number): Promise<User> {
    // DÜZƏLİŞ: Return type User
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRole(id: number, role: string): Promise<User> {
    // DÜZƏLİŞ: Return type User
    const user = await this.findOne(id); // İstifadəçinin mövcudluğunu yoxla
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async remove(id: number): Promise<void> {
    // DÜZƏLİŞ: Return type void
    await this.findOne(id); // İstifadəçinin mövcudluğunu yoxla
    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * İstifadəçinin parolunu dəyişdirir.
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<User> {
    const user = await this.findOne(userId); // İstifadəçini tap

    // Cari parolun düzgünlüyünü yoxla
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Cari parol yanlışdır.'); // Veya BadRequestException
    }

    // Yeni parolu şifrələ
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Parolu database-də yenilə
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
