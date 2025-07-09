// src/auth/auth.service.ts (YENİLƏNMİŞ VƏ TƏHLÜKƏSİZ VERSİYA)

import {
  Injectable,
  UnauthorizedException,
  ConflictException, // DƏYİŞİKLİK: BadRequestException yerinə
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from 'generated/prisma';

// TƏMİZ KOD ÜÇÜN: Şifrəsiz istifadəçi tipini təyin edirik
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // TƏMİZ KOD ÜÇÜN: Şifrəni obyektdən silən köməkçi funksiya
  private excludePassword(user: User): UserWithoutPassword {
    const { password, ...result } = user;
    return result;
  }

  async register(dto: RegisterDto): Promise<UserWithoutPassword> {
    const { name, email, password, profileImageUrl } = dto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profileImageUrl: profileImageUrl || null,
        },
      });

      // TƏHLÜKƏSİZLİK DÜZƏLİŞİ: Cavabdan şifrəni silirik
      return this.excludePassword(user);
    } catch (error) {
      // Prisma-nın unikal məhdudiyyət xətasını (P2002) tuturuq
      if (error.code === 'P2002') {
        // SEMANTİK DÜZƏLİŞ: 409 Conflict status kodu daha doğrudur
        throw new ConflictException('Bu email artıq qeydiyyatdan keçib.');
      }
      // Gözlənilməyən digər xətalar üçün
      throw new InternalServerErrorException(
        'Qeydiyyat zamanı xəta baş verdi.',
      );
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email və ya şifrə yanlışdır.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      // TƏHLÜKƏSİZLİK DÜZƏLİŞİ: Cavabdan şifrəni silirik
      user: this.excludePassword(user),
    };
  }

  // TƏMİZLİK: Bu funksiya təhlükəli olduğu üçün silinir.
  // Ehtiyac olarsa, gələcəkdə admin modulu üçün ayrıca yaradılacaq.
  // async getAllUsers() { ... }
}
