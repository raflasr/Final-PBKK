import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// DTO untuk update data user
export class UpdateUserDto {
  @IsString()          // harus bertipe string jika diisi
  @IsOptional()        // opsional, boleh tidak diisi
  name?: string;       // nama user

  @IsEmail()           // harus format email valid jika diisi
  @IsOptional()
  email?: string;      // email user

  @IsString()          // harus bertipe string jika diisi
  @IsOptional()
  @MinLength(6)        // minimal panjang 6 karakter
  @MaxLength(30)       // maksimal panjang 30 karakter
  password?: string;   // password user baru
}
