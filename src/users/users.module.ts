import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';

// ⬇ Import hashing service protocol & implementasi bcrypt
import { BcryptService } from 'src/auth/hash/bcrypt.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,

    // ⬇ PROVIDER WAJIB supaya E2E test tidak error
    {
      provide: 'HashingServiceProtocol',
      useClass: BcryptService,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
