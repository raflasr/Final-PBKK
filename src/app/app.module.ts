import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // =========================================
    // ⚙️ ENVIRONMENT CONFIGURATION
    // =========================================
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : `.env`,
      isGlobal: true,
    }),

    // =========================================
    // 🕒 SCHEDULED TASKS (for Cron Jobs)
    // =========================================
    ScheduleModule.forRoot(),

    // =========================================
    // 💌 MAIL MODULE (Email Reminder)
    // =========================================
    MailModule,

    // =========================================
    // 🧠 PRISMA (Database ORM)
    // =========================================
    PrismaModule,

    // =========================================
    // 🔐 AUTHENTICATION & AUTHORIZATION
    // =========================================
    AuthModule,

    // =========================================
    // 👥 USERS MODULE
    // =========================================
    UsersModule,

    // =========================================
    // ✅ TASKS MODULE
    // =========================================
    TasksModule,

    // =========================================
    // 📁 STATIC FILES (avatars & attachments)
    // =========================================
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
