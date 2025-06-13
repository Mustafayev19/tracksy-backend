// src/auth/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // UnauthorizedException import edin
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service'; // PrismaService'i import edin

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService, // DÜZƏLİŞ: PrismaService inject edin
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // DÜZƏLİŞ: Payloaddan `name` sahəsini də alırıq
    // Ən yaxşısı, payload.sub (ID) istifadə edərək database-dən useri yenidən gətirməkdir.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found in database for token');
    }
    // DÜZƏLİŞ: User obyektini tam olaraq qaytarırıq (id, email, name)
    return { id: user.id, email: user.email, name: user.name };
  }
}
