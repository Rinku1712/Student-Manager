import "../config/env.js";
import nodemailer from "nodemailer";

class EmailError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = "EmailError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Creates and returns configured Nodemailer transport.
 * Supports standard SMTP (port 587 / 465) as well as dedicated Gmail service.
 */
export function getTransporter() {
  const host = process.env.MAIL_HOST?.trim();
  const user = process.env.MAIL_USER?.trim();
  // Strip spaces from password in case user copied a 16-char Gmail App Password with spaces
  const pass = process.env.MAIL_PASSWORD?.trim()?.replace(/\s+/g, "");
  const port = Number(process.env.MAIL_PORT) || 587;
  const isGmail =
    host === "smtp.gmail.com" ||
    (host && host.includes("gmail")) ||
    process.env.MAIL_SERVICE?.toLowerCase() === "gmail";

  if (!user || !pass || (!host && !isGmail)) {
    return null;
  }

  // Gmail specific configuration
  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });
  }

  // Standard SMTP configuration
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587 / 25
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
  });
}

/**
 * Verifies SMTP connection at server startup.
 * Logs safe diagnostic messages without exposing credentials.
 */
export async function verifySmtpConnection() {
  const host = process.env.MAIL_HOST?.trim();
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASSWORD?.trim();
  const port = process.env.MAIL_PORT || "587";

  if (!user || !pass || (!host && process.env.MAIL_SERVICE !== "gmail")) {
    console.warn(`[MAIL] ⚠️ SMTP is NOT configured.`);
    console.warn(`[MAIL] Missing MAIL_HOST, MAIL_USER, or MAIL_PASSWORD in server/.env.`);
    console.warn(`[MAIL] Outgoing verification and password reset emails will fail until SMTP is configured.`);
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error(`[MAIL] ❌ Failed to initialize Nodemailer transporter.`);
    return false;
  }

  console.log(`[MAIL] Verifying SMTP connection to ${host || "Gmail"} (port: ${port}, user: ${user})...`);

  try {
    await transporter.verify();
    console.log(`[MAIL] ✅ SMTP connection verified successfully! Ready to deliver emails.`);
    return true;
  } catch (err) {
    console.error(`[MAIL] ❌ SMTP connection failed: [${err.code || "ERROR"}] ${err.message}`);

    if (err.code === "EAUTH" || err.responseCode === 535) {
      console.error(`[MAIL] 💡 Hint: Authentication rejected. If using Gmail:`);
      console.error(`[MAIL] 1. Enable 2-Step Verification on your Google Account.`);
      console.error(`[MAIL] 2. Generate a 16-character App Password (https://myaccount.google.com/apppasswords).`);
      console.error(`[MAIL] 3. Set MAIL_PASSWORD to the App Password (do NOT use your normal account password).`);
    } else if (err.code === "ETIMEDOUT" || err.code === "ECONNECTION") {
      console.error(`[MAIL] 💡 Hint: Connection timed out. Check firewall or try port 587 (TLS) or 465 (SSL).`);
    } else if (err.code === "ENOTFOUND") {
      console.error(`[MAIL] 💡 Hint: Mail host '${host}' could not be resolved. Verify MAIL_HOST.`);
    }

    return false;
  }
}

/**
 * Sends account verification email.
 * Throws EmailError if SMTP fails or is unconfigured.
 */
export async function sendVerificationEmail({ to, name, token }) {
  if (!to) {
    throw new EmailError("Recipient email address is required.", 400);
  }
  if (!token) {
    throw new EmailError("Verification token is required.", 400);
  }

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  const verificationUrl = `${clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const mailFrom = process.env.MAIL_FROM?.trim() || `"Student Management System" <noreply@studentmanagement.local>`;

  console.log(`[MAIL] Preparing verification email for: ${to}`);
  console.log(`[MAIL] Verification link: ${verificationUrl}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.error(`[MAIL] Email sending failed: SMTP credentials are not configured in server/.env.`);
    throw new EmailError(
      "Email delivery failed: SMTP mail service is not configured on the server. Please set MAIL_HOST, MAIL_USER, and MAIL_PASSWORD in server/.env.",
      503
    );
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Student Management account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f766e; color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #0f766e; color: #ffffff !important; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(15,118,110,0.25); }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
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
      <p>Thank you for signing up for the Student Management System. Please confirm your email address by clicking the button below to activate your account:</p>
      
      <div class="btn-wrap">
        <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" class="btn">Verify Email Address</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        ⏱️ This verification link will expire in <strong>24 hours</strong>. If you did not create this account, you can safely ignore this email.
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

  try {
    console.log(`[MAIL] Sending verification email to ${to}...`);
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject: "Verify your Student Management account",
      html,
    });

    console.log(`[MAIL] ✅ Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAIL] 📬 Ethereal Inbox Preview: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error(`[MAIL] ❌ Email sending failed to ${to}: [${err.code || "ERROR"}] ${err.message}`);

    if (err.code === "EAUTH" || err.responseCode === 535) {
      throw new EmailError(
        "Failed to send email: SMTP authentication rejected. If using Gmail, please verify you are using an App Password.",
        502
      );
    }
    if (err.code === "ETIMEDOUT" || err.code === "ECONNECTION") {
      throw new EmailError(
        "Failed to send email: SMTP mail server connection timed out. Please check MAIL_HOST and MAIL_PORT.",
        502
      );
    }
    if (err.code === "ENOTFOUND") {
      throw new EmailError(
        `Failed to send email: Mail host '${process.env.MAIL_HOST}' could not be reached.`,
        502
      );
    }

    throw new EmailError(
      `Failed to send verification email: ${err.message}`,
      502
    );
  }
}

/**
 * Sends password reset email.
 * Throws EmailError if SMTP fails or is unconfigured.
 */
export async function sendPasswordResetEmail({ to, name, token }) {
  if (!to) {
    throw new EmailError("Recipient email address is required.", 400);
  }
  if (!token) {
    throw new EmailError("Reset token is required.", 400);
  }

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const mailFrom = process.env.MAIL_FROM?.trim() || `"Student Management System" <noreply@studentmanagement.local>`;

  console.log(`[MAIL] Preparing password reset email for: ${to}`);
  console.log(`[MAIL] Reset link: ${resetUrl}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.error(`[MAIL] Email sending failed: SMTP credentials are not configured in server/.env.`);
    throw new EmailError(
      "Email delivery failed: SMTP mail service is not configured on the server. Please set MAIL_HOST, MAIL_USER, and MAIL_PASSWORD in server/.env.",
      503
    );
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Student Management password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f766e; color: #ffffff; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #0f766e; color: #ffffff !important; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(15,118,110,0.25); }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
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
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div class="btn-wrap">
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" class="btn">Reset Password</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">
        ⏱️ This reset link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
      </p>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

      <p style="font-size: 12px; color: #94a3b8;">
        If the button above does not work, copy and paste this link into your browser:<br/>
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

  try {
    console.log(`[MAIL] Sending password reset email to ${to}...`);
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject: "Reset your Student Management password",
      html,
    });

    console.log(`[MAIL] ✅ Password reset email sent successfully to ${to} (MessageId: ${info.messageId})`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[MAIL] 📬 Ethereal Inbox Preview: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error(`[MAIL] ❌ Password reset email sending failed to ${to}: [${err.code || "ERROR"}] ${err.message}`);

    if (err.code === "EAUTH" || err.responseCode === 535) {
      throw new EmailError(
        "Failed to send email: SMTP authentication rejected. If using Gmail, please verify you are using an App Password.",
        502
      );
    }
    if (err.code === "ETIMEDOUT" || err.code === "ECONNECTION") {
      throw new EmailError(
        "Failed to send email: SMTP mail server connection timed out. Please check MAIL_HOST and MAIL_PORT.",
        502
      );
    }
    if (err.code === "ENOTFOUND") {
      throw new EmailError(
        `Failed to send email: Mail host '${process.env.MAIL_HOST}' could not be reached.`,
        502
      );
    }

    throw new EmailError(
      `Failed to send password reset email: ${err.message}`,
      502
    );
  }
}

export default {
  getTransporter,
  verifySmtpConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
