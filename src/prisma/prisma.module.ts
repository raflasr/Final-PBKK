import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // menyediakan PrismaService untuk dependency injection
  exports: [PrismaService],   // supaya modul lain bisa menggunakannya tanpa import PrismaService lagi
})
export class PrismaModule {}
