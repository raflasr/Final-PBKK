import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';
import { Request } from 'express';

// Dekorator custom untuk mengambil payload JWT dari request
export const TokenPayloadParam = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();

    // mengembalikan payload token yang disimpan oleh AuthTokenGuard
    return request[REQUEST_TOKEN_PAYLOAD_NAME];
  },
);
