import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// DTO untuk query/filter user dengan pagination
export class QueryUserDto {
  @IsOptional()           // opsional, bisa dikosongkan
  @IsString()             // harus bertipe string
  search?: string;        // keyword untuk mencari user berdasarkan nama/email

  @IsOptional()
  @IsInt()                // harus bertipe integer
  @Min(1)                 // minimal 1
  page: number = 1;       // nomor halaman (default 1)

  @IsOptional()
  @IsInt()
  @Min(1)                 // minimal 1
  @Max(100)               // maksimal 100
  limit: number = 10;     // jumlah data per halaman (default 10)
}
