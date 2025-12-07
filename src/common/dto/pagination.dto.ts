import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// DTO untuk pagination query (limit & offset)
export class PaginationDto {
  @IsOptional()          // field boleh tidak diisi
  @Type(() => Number)    // ubah value ke number secara otomatis
  @IsInt()               // harus integer
  @Min(0)                // minimal 0
  @Max(50)               // maksimal 50
  limit?: number;        // jumlah data yang diambil

  @IsOptional()          // field boleh tidak diisi
  @Type(() => Number)    // ubah value ke number
  @IsInt()               // harus integer
  @Min(0)                // minimal 0
  offset?: number;       // mulai dari index ke berapa
}
