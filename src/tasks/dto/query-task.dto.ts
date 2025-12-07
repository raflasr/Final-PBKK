import { IsOptional, IsString, IsInt, Max, Min, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO untuk query/filter task
export class QueryTaskDto {
  @IsOptional()
  @IsString()
  search?: string; // Filter berdasarkan nama atau deskripsi task (opsional)

  @IsOptional()
  @IsString()
  priority?: string; // Filter berdasarkan prioritas: low, medium, high (opsional)

  @IsOptional()
  @IsString()
  status?: string; // Filter berdasarkan status: pending, done (opsional)

  @IsOptional()
  @IsString()
  category?: string; // Filter berdasarkan kategori task (opsional)

  @IsOptional()
  @IsDateString({}, { message: 'dueDate must be a valid ISO date.' })
  dueDate?: string; // Filter berdasarkan tanggal jatuh tempo (opsional)

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean value.' })
  @Type(() => Boolean)
  isPublic?: boolean; // Filter task publik/private (opsional)

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1; // Pagination: halaman saat ini (default 1)

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10; // Pagination: jumlah data per halaman (default 10, max 100)
}
