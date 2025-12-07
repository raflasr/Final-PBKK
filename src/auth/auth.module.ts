import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hash/hash.service';
import { BcryptService } from './hash/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

// @Global() → modul ini bersifat global, tidak perlu di-import lagi di modul lain
@Global()
@Module({
  imports: [
    PrismaModule,                      // modul database
    ConfigModule.forFeature(jwtConfig), // load konfigurasi JWT
    JwtModule.registerAsync(jwtConfig.asProvider()), // konfigurasi JWT dinamis
  ],
  providers: [
    {
      provide: HashingServiceProtocol, // inject HashingServiceProtocol
      useClass: BcryptService,         // implementasinya pakai BcryptService
    },
    AuthService,                        // service autentikasi
  ],
  controllers: [AuthController],        // controller untuk auth
  exports: [HashingServiceProtocol, JwtModule, ConfigModule], // bisa dipakai modul lain
})
export class AuthModule {}
