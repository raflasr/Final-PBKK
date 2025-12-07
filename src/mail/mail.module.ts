import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailController } from './mail.controller';

// Helper untuk memastikan environment variable ada
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} not set`);
  return value;
}

@Module({
  imports: [
    ScheduleModule.forRoot(), // untuk fitur cron / scheduler
    MailerModule.forRoot({    // konfigurasi mailer
      transport: {
        host: getEnvVar('MAIL_HOST'),         // host SMTP
        port: parseInt(getEnvVar('MAIL_PORT')),// port SMTP
        auth: {
          user: getEnvVar('MAIL_USER'),       // user SMTP
          pass: getEnvVar('MAIL_PASS'),       // password SMTP
        },
      },
      defaults: {
        from: `"Task Reminder" <${getEnvVar('MAIL_USER')}>`, // default sender
      },
    }),
  ],
  controllers: [MailController], // controller untuk endpoint mail
  providers: [MailService, PrismaService], // service untuk mail & akses DB
  exports: [MailService], // supaya modul lain bisa pakai MailService
})
export class MailModule {}
