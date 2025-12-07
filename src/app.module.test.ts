import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

// Module khusus untuk testing
@Module({
  imports: [
    PrismaModule,   // Modul database Prisma
    AuthModule,     // Modul autentikasi (login/register)
    UsersModule,    // Modul user
    TasksModule,    // Modul task
  ],
})
export class AppTestModule {}
