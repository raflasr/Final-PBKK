// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays, isSameDay } from 'date-fns';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name); // logger khusus service

  constructor(
    private readonly mailerService: MailerService, // service untuk kirim email
    private readonly prisma: PrismaService,        // akses DB untuk ambil task/user
  ) {}

  // 🔹 Cron job harian jam 8 pagi → otomatis jalan setiap hari
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDueDateReminders() {
    const tomorrow = addDays(new Date(), 1); // tanggal besok
    const tasks = await this.prisma.task.findMany({
      where: { dueDate: { not: null } }, // ambil task yang ada dueDate
      include: { user: true },           // ambil data user terkait
    });

    // filter task yang due besok
    const dueSoon = tasks.filter(t => t.dueDate && isSameDay(t.dueDate, tomorrow));

    for (const task of dueSoon) {
      if (!task.user?.email) continue; // skip jika user tidak punya email

      try {
        await this.mailerService.sendMail({
          to: task.user.email,
          subject: `Reminder: Task "${task.name}" is due tomorrow!`,
          text: `Hello ${task.user.name || 'User'}, your task "${task.name}" is due on ${task.dueDate!.toDateString()}.`,
        });
        this.logger.log(`✅ Sent reminder for task "${task.name}" to ${task.user.email}`);
      } catch (err) {
        this.logger.error(`Failed to send reminder for task "${task.name}": ${err.message}`);
      }
    }

    this.logger.log(`🔔 Checked ${tasks.length} tasks, ${dueSoon.length} reminders sent.`);
  }

  // 🔹 Fungsi khusus testing → kirim email untuk task yang due hari ini
  async sendTodayDueReminders(): Promise<number> {
    const today = new Date();
    const tasks = await this.prisma.task.findMany({
      where: { dueDate: { not: null } },
      include: { user: true },
    });

    // filter task yang due hari ini
    const dueToday = tasks.filter(t => t.dueDate && isSameDay(t.dueDate, today));

    for (const task of dueToday) {
      if (!task.user?.email) continue;

      try {
        await this.mailerService.sendMail({
          to: task.user.email,
          subject: `Reminder: Task "${task.name}" is due today!`,
          text: `Hello ${task.user.name || 'User'}, your task "${task.name}" is due today (${task.dueDate!.toDateString()}).`,
        });
        this.logger.log(`✅ Sent TODAY reminder for task "${task.name}" to ${task.user.email}`);
      } catch (err) {
        this.logger.error(`Failed to send TODAY reminder for task "${task.name}": ${err.message}`);
      }
    }

    this.logger.log(`🔔 Sent ${dueToday.length} TODAY reminders.`);
    return dueToday.length; // kembalikan jumlah email yang dikirim
  }
}
