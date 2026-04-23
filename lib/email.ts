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
    requireTLS: port !== 465,
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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gutshell.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Gut Shell';

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
          <h1 style="color:white;margin:0;font-size:24px;">Gut Shell</h1>
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
          &copy; ${new Date().getFullYear()} Gut Shell. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function otpEmail(otp: string, purpose: 'SIGNUP' | 'RESET_PASSWORD', name?: string) {
  const title = purpose === 'SIGNUP' ? 'Verify Your Email' : 'Reset Your Password';
  const intro = purpose === 'SIGNUP'
    ? 'Thanks for signing up! Use this verification code to complete your registration:'
    : 'We received a request to reset your password. Use this code to proceed:';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><title>${title}</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Gut Shell</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#3D4127;margin:0 0 20px;">${title}</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${name || 'there'},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">${intro}</p>
          <div style="background:#F5F7EC;border:2px dashed #636B2F;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <div style="color:#636B2F;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Your Code</div>
            <div style="color:#3D4127;font-size:36px;font-weight:bold;letter-spacing:8px;font-family:monospace;">${otp}</div>
          </div>
          <p style="color:#555;line-height:1.6;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <p style="color:#888;line-height:1.6;font-size:13px;margin-top:30px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background:#F5F7EC;padding:20px;text-align:center;color:#888;font-size:12px;">
          &copy; ${new Date().getFullYear()} Gut Shell. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function doctorWelcomeEmail(name: string, email: string, tempPassword: string, loginUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">Welcome to Gut Shell</h1>
        </div>
        <div style="padding:40px 30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${name},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">Your doctor account has been created. Here are your login credentials:</p>
          <div style="background:#F5F7EC;border-radius:12px;padding:20px;margin:20px 0;">
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0;"><strong>Temporary Password:</strong> <code style="background:white;padding:4px 8px;border-radius:4px;font-family:monospace;">${tempPassword}</code></p>
          </div>
          <div style="text-align:center;margin:30px 0;">
            <a href="${loginUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;">Log In Now</a>
          </div>
          <p style="color:#888;line-height:1.6;font-size:13px;">Please change your password after your first login for security.</p>
        </div>
        <div style="background:#F5F7EC;padding:20px;text-align:center;color:#888;font-size:12px;">
          &copy; ${new Date().getFullYear()} Gut Shell
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

interface AppointmentEmailData {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  amount?: number;
  appointmentUrl?: string;
}

export function appointmentConfirmationEmail(data: AppointmentEmailData) {
  const feeRow = data.amount !== undefined && data.amount > 0
    ? `<tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Amount Paid</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">₹${data.amount.toLocaleString('en-IN')}</td></tr>`
    : '';
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><title>Appointment Confirmed</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">✅ Appointment Confirmed</h1>
        </div>
        <div style="padding:40px 30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${data.patientName},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">Your appointment with <strong>Dr. ${data.doctorName}</strong> is confirmed. We look forward to seeing you.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;background:#F5F7EC;border-radius:12px;">
            <tr><td style="padding:14px 16px;color:#888;font-size:13px;width:120px;">Date</td><td style="padding:14px 16px;color:#3D4127;font-weight:600;">${data.date}</td></tr>
            <tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Time</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">${data.time}</td></tr>
            <tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Type</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">${data.type}</td></tr>
            ${feeRow}
          </table>
          ${data.appointmentUrl ? `<div style="text-align:center;margin:30px 0;"><a href="${data.appointmentUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;">View Appointment</a></div>` : ''}
          <p style="color:#888;line-height:1.6;font-size:13px;margin-top:20px;">If you need to reschedule or cancel, please do so at least 24 hours before your appointment.</p>
        </div>
        <div style="background:#F5F7EC;padding:20px;text-align:center;color:#888;font-size:12px;">
          &copy; ${new Date().getFullYear()} Gut Shell
        </div>
      </div>
    </body>
    </html>
  `;
}

export function doctorAppointmentNotifyEmail(data: AppointmentEmailData & { healthConcerns?: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:24px 30px;">
          <h1 style="color:white;margin:0;font-size:20px;">📅 New Appointment Booked</h1>
        </div>
        <div style="padding:30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi Dr. ${data.doctorName},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">${data.patientName} has booked a ${data.type.toLowerCase()} with you.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr><td style="padding:10px 0;color:#888;font-size:13px;width:120px;">Patient</td><td style="padding:10px 0;color:#333;font-weight:600;">${data.patientName}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #eee;">Date</td><td style="padding:10px 0;color:#333;border-top:1px solid #eee;">${data.date}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #eee;">Time</td><td style="padding:10px 0;color:#333;border-top:1px solid #eee;">${data.time}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #eee;">Type</td><td style="padding:10px 0;color:#333;border-top:1px solid #eee;">${data.type}</td></tr>
          </table>
          ${data.healthConcerns ? `<div style="margin-top:20px;padding:16px;background:#F5F7EC;border-radius:12px;border-left:4px solid #636B2F;"><p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Health Concerns</p><p style="color:#333;line-height:1.6;font-size:14px;white-space:pre-wrap;margin:0;">${data.healthConcerns}</p></div>` : ''}
          ${data.appointmentUrl ? `<div style="text-align:center;margin:24px 0 0;"><a href="${data.appointmentUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px;">View in Dashboard</a></div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentRescheduledEmail(data: AppointmentEmailData & { oldDate?: string; oldTime?: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🔄 Appointment Rescheduled</h1>
        </div>
        <div style="padding:40px 30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${data.patientName},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">Your appointment with Dr. ${data.doctorName} has been rescheduled.</p>
          ${data.oldDate ? `<p style="color:#aaa;line-height:1.6;font-size:14px;text-decoration:line-through;">${data.oldDate} at ${data.oldTime}</p>` : ''}
          <div style="background:#F5F7EC;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:0 0 8px;color:#888;font-size:13px;">New Time</p>
            <p style="margin:0;color:#3D4127;font-weight:700;font-size:16px;">${data.date} &middot; ${data.time}</p>
          </div>
          ${data.appointmentUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${data.appointmentUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;">View Appointment</a></div>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function appointmentCancelledEmail(data: AppointmentEmailData & { refundAmount?: number }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#9C6B3F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">Appointment Cancelled</h1>
        </div>
        <div style="padding:40px 30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${data.patientName},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">Your appointment with Dr. ${data.doctorName} on <strong>${data.date} at ${data.time}</strong> has been cancelled.</p>
          ${data.refundAmount && data.refundAmount > 0 ? `<div style="background:#F5F7EC;border-radius:12px;padding:16px;margin:16px 0;"><p style="margin:0;color:#3D4127;font-size:14px;">💳 A refund of <strong>₹${data.refundAmount.toLocaleString('en-IN')}</strong> has been initiated and will reflect in your original payment method within 5-7 business days.</p></div>` : ''}
          <p style="color:#888;line-height:1.6;font-size:13px;margin-top:20px;">You can book a new appointment anytime from your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function packagePurchasedEmail(data: { patientName: string; packageName: string; sessions: number; validityDays: number; amount: number; packagesUrl?: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f7ec;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
        <div style="background:#636B2F;padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">🎉 Package Activated</h1>
        </div>
        <div style="padding:40px 30px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">Hi ${data.patientName},</p>
          <p style="color:#555;line-height:1.6;font-size:15px;">Thanks for purchasing the <strong>${data.packageName}</strong> package. It&apos;s now active on your account.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;background:#F5F7EC;border-radius:12px;">
            <tr><td style="padding:14px 16px;color:#888;font-size:13px;width:120px;">Package</td><td style="padding:14px 16px;color:#3D4127;font-weight:600;">${data.packageName}</td></tr>
            <tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Sessions</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">${data.sessions}</td></tr>
            <tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Valid For</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">${data.validityDays} days</td></tr>
            <tr><td style="padding:10px 16px;color:#888;font-size:13px;border-top:1px solid #eee;">Amount Paid</td><td style="padding:10px 16px;color:#3D4127;font-weight:600;border-top:1px solid #eee;">₹${data.amount.toLocaleString('en-IN')}</td></tr>
          </table>
          ${data.packagesUrl ? `<div style="text-align:center;margin:30px 0;"><a href="${data.packagesUrl}" style="display:inline-block;background:#636B2F;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;">Book Your First Session</a></div>` : ''}
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
