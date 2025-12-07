import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// DTO untuk membuat user baru
export class CreateUserDto {
  @IsString()             // harus bertipe string
  @IsNotEmpty()           // tidak boleh kosong
  name: string;           // nama user

  @IsEmail()              // harus format email valid
  @IsNotEmpty()           // tidak boleh kosong
  email: string;          // email user

  @IsString()             // harus bertipe string
  @IsNotEmpty()           // tidak boleh kosong
  @MinLength(6, {
    message: 'password must be longer than or equal to 6 characters',
  })                      // minimal 6 karakter
  @MaxLength(30)          // maksimal 30 karakter
  password: string;       // password user
}
