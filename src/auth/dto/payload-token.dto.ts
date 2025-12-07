export class PayloadTokenDto {
  sub: number;  // ID user (subject)
  email: string; // email user
  iat: number;   // issued at (waktu token dibuat)
  exp: number;   // expired at (waktu token berakhir)
  aud: string;   // audience (penerima token)
  iss: string;   // issuer (pembuat token)
}
