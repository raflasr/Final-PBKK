import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { HashingServiceProtocol } from './hash/hash.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// Interface payload JWT
interface JwtPayload {
  sub: number;   // ID user
  email: string; // email user
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,                   // akses database
    private readonly hashingService: HashingServiceProtocol, // layanan hashing

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, // config JWT

    private readonly jwtService: JwtService,                 // service JWT
  ) {}

  // ================= REGISTER USER =================
  async register(userData: { name: string; email: string; password: string; avatar?: string }) {
    // cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST);
    }

    // hash password
    const hashedPassword = await this.hashingService.hash(userData.password);

    // simpan user baru di database
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        avatar: userData.avatar || null,
        active: true,
      },
    });

    // kembalikan data user tanpa password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
  }

  // ================= LOGIN / AUTHENTICATE =================
  async authenticate(signInDto: SignInDto) {
    // cari user aktif berdasarkan email
    const user = await this.prisma.user.findFirst({
      where: { email: signInDto.email, active: true },
    });

    if (!user) {
      throw new HttpException('Falha ao autenticar usuário', HttpStatus.UNAUTHORIZED);
    }

    // validasi password
    const passwordIsValid = await this.hashingService.compare(
      signInDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new HttpException('Senha e/ou login incorretos', HttpStatus.UNAUTHORIZED);
    }

    // buat payload JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // generate JWT token
    const token = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret || process.env.JWT_SECRET,
      expiresIn: Number(this.jwtConfiguration.jwtTtl || process.env.JWT_TTL),
      audience: this.jwtConfiguration.audience || process.env.JWT_TOKEN_AUDIENCE,
      issuer: this.jwtConfiguration.issuer || process.env.JWT_TOKEN_ISSUER,
    });

    // kembalikan data user + token
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    };
  }

  // ================= VALIDATE JWT =================
  async validateToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtConfiguration.secret || process.env.JWT_SECRET,
        audience: this.jwtConfiguration.audience || process.env.JWT_TOKEN_AUDIENCE,
        issuer: this.jwtConfiguration.issuer || process.env.JWT_TOKEN_ISSUER,
      });
      return decoded; // kembalikan payload jika valid
    } catch (error) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }
  }
}
