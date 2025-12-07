import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
// Service untuk akses database menggunakan Prisma
// Meng-extend PrismaClient agar semua method Prisma tersedia
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Dipanggil saat modul diinisialisasi
  async onModuleInit() {
    await this.$disconnect(); // disconnect dulu (biasanya untuk reset koneksi)
  }

  // Dipanggil saat modul dihancurkan
  async onModuleDestroy() {
    await this.$connect(); // connect kembali saat modul di-destroy (untuk cleanup)
  }
}
