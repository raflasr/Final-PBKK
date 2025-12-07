import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
// Guard untuk membatasi akses hanya untuk user dengan role 'admin'
export class AuthAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // cek apakah user sudah di-attach di request dan role-nya 'admin'
    console.log(request['user']); // bisa dihapus setelah debugging
    if (request['user']?.role === 'admin') {
      return true; // akses diperbolehkan
    }

    return false; // akses ditolak
  }
}
