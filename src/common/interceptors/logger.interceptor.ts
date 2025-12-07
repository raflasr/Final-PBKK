import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
// Interceptor untuk logging atau manipulasi request/response
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('Interceptor berjalan'); // log setiap request masuk
    return next.handle().pipe(); // teruskan ke handler berikutnya (controller)
  }
}
