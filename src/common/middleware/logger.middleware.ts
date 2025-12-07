import { NestMiddleware, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
// Middleware untuk menempelkan info user ke request (contoh sederhana)
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization; // ambil header Authorization

    // jika header ada, buat objek user sederhana di request
    if (authorization) {
      req['user'] = {
        token: authorization, // simpan token
        role: 'admin',         // contoh role admin
      };
    }

    next(); // lanjut ke middleware berikutnya atau controller
  }
}
