import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,   // service untuk verifikasi JWT
    private readonly prisma: PrismaService,     // akses database user

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, // config JWT dari env
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractToken(request); // ambil token dari header
    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan.');
    }

    try {
      // verifikasi token memakai secret, issuer, dan audience
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      // simpan payload ke request supaya bisa dipakai di controller
      request[REQUEST_TOKEN_PAYLOAD_NAME] = payload;

      // cek apakah user masih aktif
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user?.active) {
        throw new UnauthorizedException('Akses tidak diizinkan!');
      }

      return true; // akses diperbolehkan
    } catch (error) {
      console.error('AuthTokenGuard error:', error.message);
      throw new UnauthorizedException('Akses ditolak');
    }
  }

  // ambil token dari header Authorization: Bearer <token>
  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
