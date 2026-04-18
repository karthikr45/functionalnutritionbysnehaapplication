import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error('SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD in .env');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@functionalnutritionbysneha.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Functional Nutrition by Sneha';

  const t = getTransporter();
  return t.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
}

export function passwordResetEmail(resetUrl: string, name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><title>Reset Your Password</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Functional Nutrition by Sneha</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#3D4127;margin:0 0 20px;">Reset Your Password</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${name || 'there'},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;font-size:15px;">Reset Password</a>
          </div>
          <p style="color:#555;line-height:1.6;font-size:14px;">Or copy and paste this link into your browser:</p>
          <p style="color:#636B2F;font-size:13px;word-break:break-all;background:#F5F7EC;padding:12px;border-radius:8px;">${resetUrl}</p>
          <p style="color:#888;line-height:1.6;font-size:13px;margin-top:30px;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="background:#F5F7EC;padding:20px;text-align:center;color:#888;font-size:12px;">
          &copy; ${new Date().getFullYear()} Functional Nutrition by Sneha. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function contactFormEmail(data: { name: string; email: string; phone?: string; message: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:24px 30px;">
          <h1 style="color:white;margin:0;font-size:20px;">📬 New Contact Form Submission</h1>
        </div>
        <div style="padding:30px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#888;font-size:13px;width:100px;">Name</td><td style="padding:10px 0;color:#333;font-weight:600;">${data.name}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #eee;">Email</td><td style="padding:10px 0;color:#333;border-top:1px solid #eee;"><a href="mailto:${data.email}" style="color:#636B2F;">${data.email}</a></td></tr>
            ${data.phone ? `<tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #eee;">Phone</td><td style="padding:10px 0;color:#333;border-top:1px solid #eee;">${data.phone}</td></tr>` : ''}
          </table>
          <div style="margin-top:24px;padding:20px;background:#F5F7EC;border-radius:12px;border-left:4px solid #636B2F;">
            <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Message</p>
            <p style="color:#333;line-height:1.7;font-size:14px;white-space:pre-wrap;margin:0;">${data.message}</p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px;text-align:center;">Reply directly to this email to respond to ${data.name}.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
