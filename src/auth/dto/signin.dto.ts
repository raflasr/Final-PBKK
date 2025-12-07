import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()       // harus format email
  @IsNotEmpty()    // tidak boleh kosong
  email: string;

  @IsString()      // harus berupa string
  @IsNotEmpty()    // tidak boleh kosong
  password: string;
}
