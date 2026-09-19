import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from '../../config/env';

@Injectable()
export class MailerService {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }

    async sendVerificationEmail(input: { email: string; name: string | null; otp: string; magicLink: string }) {
        const firstName = input.name?.split(' ')[0] ?? 'there';

        const html = this.buildVerificationTemplate({
            firstName,
            otp: input.otp,
            magicLink: input.magicLink,
        });

        await this.transporter.sendMail({
            from: env.MAIL_FROM,
            to: input.email,
            subject: 'Verify your Qore email',
            html,
        });
    }

    async sendPasswordResetEmail(input: { email: string; name: string | null; resetLink: string }) {
        const firstName = input.name?.split(' ')[0] ?? 'there';

        const html = this.buildPasswordResetTemplate({
            firstName,
            resetLink: input.resetLink,
        });

        await this.transporter.sendMail({
            from: env.MAIL_FROM,
            to: input.email,
            subject: 'Reset your Qore password',
            html,
        });
    }

    private buildVerificationTemplate(input: { firstName: string; otp: string; magicLink: string }) {
        const { firstName, otp, magicLink } = input;

        return `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
  </head>
  <body style="margin:0; padding:0; background:#0A0A0C; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background:#141417; border:1px solid #232327; border-radius:24px; overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 0 40px; text-align:center;">
                <!-- Замінено назву та додано фірмовий синій колір -->
                <p style="margin:0; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#3B82F6;">Qore</p>
                <h1 style="margin:18px 0 0 0; font-size:26px; line-height:1.25; font-weight:700; color:#F5F4F2; font-family: 'Space Grotesk', Georgia, serif;">
                  One last step,<br/>${firstName}.
                </h1>
                <p style="margin:14px 0 0 0; font-size:15px; line-height:1.6; color:#94938D;">
                  Confirm your email to activate your workspace and start building your venue.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <a href="${magicLink}" target="_blank" rel="noopener"
                  style="display:block; width:100%; box-sizing:border-box; padding:16px 24px; text-align:center; background:#F5F4F2; color:#0A0A0C; text-decoration:none; border-radius:16px; font-size:15px; font-weight:600; letter-spacing:0.01em;">
                  Verify Email
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px; text-align:center;">
                <p style="margin:0; font-size:13px; color:#6B6A65;">Or enter this 6-digit code</p>
                <!-- Виправлено верстку цифр для сумісності з поштовими клієнтами -->
                <div style="margin-top:14px; text-align:center;">
                  ${otp
                      .split('')
                      .map(
                          (d) =>
                              `<span style="display:inline-block; width:44px; height:56px; line-height:56px; margin:0 4px; background:#1C1C20; border:1px solid #2A2A30; border-radius:12px; color:#F5F4F2; font-size:22px; font-weight:600; font-family: 'JetBrains Mono', monospace; text-align:center;">${d}</span>`,
                      )
                      .join('')}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px 40px;">
                <!-- Замінено назву в тексті відмови -->
                <p style="margin:0; font-size:12px; line-height:1.6; color:#6B6A65; text-align:center;">
                  This link and code expire in 15 minutes. If you didn't create a Qore account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <!-- Оновлено футер -->
          <p style="margin:24px 0 0 0; font-size:12px; color:#4A4A47;">© Qore · The intelligent operating system for hospitality.</p>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
    }

    private buildPasswordResetTemplate(input: { firstName: string; resetLink: string }) {
        const { firstName, resetLink } = input;

        return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset your password</title>
        </head>
        <body style="margin:0; padding:0; background:#0A0A0C; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0C; padding:40px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin:0 auto; background:#141417; border:1px solid #232327; border-radius:24px; overflow:hidden;">
                  <tr>
                    <td style="padding:40px 40px 0 40px; text-align:center;">
                      <p style="margin:0; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#3B82F6;">Qore</p>
                      <h1 style="margin:18px 0 0 0; font-size:26px; line-height:1.25; font-weight:700; color:#F5F4F2; font-family: 'Space Grotesk', Georgia, serif;">
                        Reset your password,<br/>${firstName}.
                      </h1>
                      <p style="margin:14px 0 0 0; font-size:15px; line-height:1.6; color:#94938D;">
                        We received a request to reset your password. This link expires in 15 minutes.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px 0 40px;">
                      <a href="${resetLink}" target="_blank" rel="noopener"
                        style="display:block; width:100%; box-sizing:border-box; padding:16px 24px; text-align:center; background:#3B82F6; color:#FFFFFF; text-decoration:none; border-radius:16px; font-size:15px; font-weight:600; letter-spacing:0.01em;">
                        Reset password
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 40px 0 40px; text-align:center;">
                      <p style="margin:0; font-size:13px; color:#6B6A65;">Or copy this link into your browser:</p>
                      <p style="margin:10px 0 0 0; font-size:12px; line-height:1.5; color:#6B6A65; word-break:break-all; font-family: 'JetBrains Mono', monospace;">
                        ${resetLink}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 40px 40px 40px;">
                      <p style="margin:0; font-size:12px; line-height:1.6; color:#6B6A65; text-align:center;">
                        If you didn't request a password reset, you can safely ignore this email — your password will stay the same.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0; font-size:12px; color:#4A4A47;">© Qore · The intelligent operating system for hospitality.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    }
}
