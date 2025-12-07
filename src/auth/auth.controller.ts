import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';

@Controller('auth') // semua endpoint di controller ini berada di /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {} // inject AuthService

  @Post() // POST /auth
  signIn(@Body() signInDto: SignInDto) {
    // kirim data login ke AuthService untuk proses autentikasi
    return this.authService.authenticate(signInDto);
  }
}
