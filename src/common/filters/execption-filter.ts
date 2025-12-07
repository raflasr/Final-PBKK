import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Filter global untuk menangani HttpException
@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>(); // ambil response object
    const request = context.getRequest<Request>();   // ambil request object
    const status = exception.getStatus();            // ambil status code
    const errorMessage = exception.getResponse();    // ambil pesan error

    // kirim response JSON standar untuk semua HttpException
    response.status(status).json({
      statusCode: status,                            // kode HTTP
      timeStamp: new Date().toISOString(),          // waktu error terjadi
      message:
        errorMessage !== '' ? errorMessage : 'Erro ao realizar essa operação.', // pesan error
      path: request.url,                             // path endpoint yang dipanggil
    });
  }
}
