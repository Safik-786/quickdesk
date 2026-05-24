import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromAddress = 'quickdesk-support@gmail.com';

  async onModuleInit() {
    try {
      if (process.env.ENABLE_EMAIL === 'false') {
        this.logger.warn(
          'Email service is explicitly disabled via ENABLE_EMAIL=false. Skipping Google SMTP transporter initialization.',
        );
        return;
      }

      // Default to Google SMTP/Gmail configurations
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS; // 16-character Google App Passkey

      if (user && pass) {
        this.logger.log(
          `Initializing free Google SMTP Transporter (${host}:${port}) for user: ${user}...`,
        );
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465, // true for 465 SSL, false for STARTTLS
          auth: { user, pass },
        });
        this.fromAddress = process.env.SMTP_FROM || user;
      } else {
        this.logger.error(
          '❌ Google SMTP / Gmail credentials missing! Please configure SMTP_USER (your Gmail address) and SMTP_PASS (your 16-character Google App Passkey) inside your .env file to enable email dispatch.',
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to initialize Google SMTP Nodemailer transporter',
        error,
      );
    }
  }

  async sendMail(to: string, subject: string, htmlContent: string) {
    if (!this.transporter) {
      this.logger.warn(
        'Google SMTP transporter not initialized (missing .env credentials), skipping mail dispatch.',
      );
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      await this.transporter.sendMail({
        from: `"QuickDesk Support" <${this.fromAddress}>`,
        to,
        subject,
        html: htmlContent,
      });

      this.logger.log(
        `✉️ Email dispatched successfully via Google SMTP: Subject="${subject}" To="${to}"`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} via Google SMTP`, error);
    }
  }
}
