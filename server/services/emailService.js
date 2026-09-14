import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT || 587;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM || `"Student Management" <noreply@studentmanagement.local>`;

let transporter = null;

if (MAIL_HOST && MAIL_USER && MAIL_PASSWORD) {
  transporter = nodemailer.createTransporter({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: Number(MAIL_PORT) === 465,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });
}

/**
 * Sends account verification email.
 */
export async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = `${CLIENT_URL}/#verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f766e; color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px; line-height: 1.6; font-size: 15px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #0f766e; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15,118,110,0.2); }
    .btn:hover { background: #115e59; }
    .footer { background: #f1f5f9; padding: 16px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .link-fallback { word-break: break-all; font-size: 13px; color: #0f766e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Student Management System</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name || "User"}</strong>,</p>
      <p>Thanks for creating an account to access the Student Management Portal. Please click the button below to verify your email address and activate your account:</p>
      
      <div class="btn-wrap">
        <a href="${verificationUrl}" target="_blank" class="btn">Verify Email Address</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        This verification link will expire in <strong>24 hours</strong>. If you did not create this account, please disregard this message.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="font-size: 12px; color: #94a3b8;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${verificationUrl}" class="link-fallback">${verificationUrl}</a>
      </p>
    </div>
    <div class="footer">
      Student Management System • Secure Administration Portal
    </div>
  </div>
</body>
</html>
  `;

  // Always log to server terminal for instant development testing
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL SERVICE] Verification Email for: ${to}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔗 Verification Link: ${verificationUrl}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: "Verify Your Email - Student Management System",
        html,
      });
    } catch (err) {
      console.warn(`[Nodemailer Warning] Failed to dispatch verification email to ${to}:`, err.message);
    }
  }
}

/**
 * Sends password reset email.
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${CLIENT_URL}/#reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f766e; color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px; line-height: 1.6; font-size: 15px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #0f766e; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15,118,110,0.2); }
    .btn:hover { background: #115e59; }
    .footer { background: #f1f5f9; padding: 16px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .link-fallback { word-break: break-all; font-size: 13px; color: #0f766e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Student Management System</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name || "User"}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new password:</p>
      
      <div class="btn-wrap">
        <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        This reset link will expire in <strong>1 hour</strong>. If you did not request this password reset, your account is safe and you can safely ignore this email.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="font-size: 12px; color: #94a3b8;">
        If the button does not work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" class="link-fallback">${resetUrl}</a>
      </p>
    </div>
    <div class="footer">
      Student Management System • Security & Account Access
    </div>
  </div>
</body>
</html>
  `;

  console.log(`\n======================================================`);
  console.log(`🔑 [EMAIL SERVICE] Password Reset Link for: ${to}`);
  console.log(`👤 Name: ${name}`);
  console.log(`🔗 Reset Link: ${resetUrl}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: "Reset Your Password - Student Management System",
        html,
      });
    } catch (err) {
      console.warn(`[Nodemailer Warning] Failed to dispatch reset email to ${to}:`, err.message);
    }
  }
}

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
