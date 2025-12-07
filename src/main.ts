import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// 🚀 Entry point aplikasi
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // ✅ ValidationPipe lengkap agar e2e test membaca array message dengan benar
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // hanya izinkan properti yang ada di DTO
      transform: true, // otomatis konversi tipe data
      forbidNonWhitelisted: true, // tolak properti yang tidak diharapkan
      validationError: {
        target: false,
        value: false,
      },
      // 👇 custom error agar format sesuai e2e test
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (err) =>
            Object.values(err.constraints || {})[0] ||
            'Validation failed for some fields',
        );
        return new BadRequestException(messages);
      },
    }),
  );

  // ✅ Konfigurasi Swagger (API Docs)
  const configSwagger = new DocumentBuilder()
    .setTitle('Lista de tarefas')
    .setDescription('API Lista de tarefas - NestJS Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📘 Swagger Docs: http://localhost:${process.env.PORT ?? 3000}/docs`);
}

bootstrap();
