import { registerAs } from '@nestjs/config';

// Bentuk konfigurasi JWT
export interface JwtConfig {
  secret: string;   // kunci untuk sign JWT
  audience: string; // penerima token
  issuer: string;   // pembuat token
  jwtTtl: number;   // waktu berlaku token (detik)
}

// Daftarkan konfigurasi dengan nama "jwt"
export default registerAs(
  'jwt',
  (): JwtConfig => ({
    secret: process.env.JWT_SECRET ?? 'default_secret',       // ambil dari env / pakai default
    audience: process.env.JWT_TOKEN_AUDIENCE ?? 'http://localhost:3000', // isi default
    issuer: process.env.JWT_TOKEN_ISSUER ?? 'http://localhost:3000',     // isi default
    jwtTtl: Number(process.env.JWT_TTL ?? 259200),            // ubah env ke number (default 3 hari)
  }),
);
