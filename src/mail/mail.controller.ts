// src/mail/mail.controller.ts
import { Controller, Post, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail') // semua endpoint di controller ini berada di /mail
export class MailController {
  private readonly logger = new Logger(MailController.name); // logger khusus controller

  constructor(private readonly mailService: MailService) {} // inject MailService

  // Endpoint POST /mail/send-reminders-test
  // Digunakan untuk testing kirim email reminder task yang due hari ini
  @Post('send-reminders-test')
  async sendRemindersTest() {
    try {
      // panggil service untuk mengirim email reminder
      const count = await this.mailService.sendTodayDueReminders();

      // kembalikan jumlah email yang berhasil dikirim
      return { message: `Email reminders sent for ${count} tasks.` };
    } catch (err) {
      this.logger.error(err.message); // log error jika gagal
      return { message: 'Failed to send email reminders' }; // response error
    }
  }
}
