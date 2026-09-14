import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import emailService from "./emailService.js";

const AUTH_SECRET =
  process.env.AUTH_SECRET || "antigravity_dev_secret_student_portal_2026";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Validates password strength:
 * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number.
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  return null;
}

/**
 * Strips sensitive fields (hashes, raw tokens) before sending to client.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "admin",
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Generates sequential user ID (e.g. USR-2026-0001)
 */
function generateUserId(existingUsers = []) {
  const year = new Date().getFullYear();
  let nextNum = existingUsers.length + 1;
  let candidate = `USR-${year}-${String(nextNum).padStart(4, "0")}`;

  while (existingUsers.some((u) => u.id === candidate)) {
    nextNum++;
    candidate = `USR-${year}-${String(nextNum).padStart(4, "0")}`;
  }
  return candidate;
}

/**
 * SHA-256 hash helper for verification & reset tokens
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authService = {
  /**
   * Register a new user
   */
  async signup({ name, email, password, confirmPassword }) {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AuthError("Full name is required.", 400, { field: "name" });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new AuthError("Valid email address is required.", 400, {
        field: "email",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AuthError(
        "An account with this email already exists.",
        409,
        { field: "email" }
      );
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      throw new AuthError(pwdError, 400, { field: "password" });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw new AuthError("Passwords do not match.", 400, {
        field: "confirmPassword",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate random verification token and hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(rawToken);
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString(); // 24 hours

    const allUsers = await userRepository.getAll();
    const newUserId = generateUserId(allUsers);
    const now = new Date().toISOString();

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
      verificationTokenHash,
      verificationTokenExpiresAt,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    };

    await userRepository.create(newUser);

    // Send verification email via Nodemailer
    await emailService.sendVerificationEmail({
      to: normalizedEmail,
      name: newUser.name,
      token: rawToken,
    });

    return sanitizeUser(newUser);
  },

  /**
   * Verify email address with token
   */
  async verifyEmail(rawToken) {
    if (!rawToken || typeof rawToken !== "string") {
      throw new AuthError("Verification token is required.", 400);
    }

    const tokenHash = hashToken(rawToken.trim());
    const user = await userRepository.findByVerificationTokenHash(tokenHash);

    if (!user) {
      throw new AuthError(
        "Invalid or expired verification link. Please request a new one.",
        400
      );
    }

    if (
      user.verificationTokenExpiresAt &&
      new Date(user.verificationTokenExpiresAt) < new Date()
    ) {
      throw new AuthError(
        "Verification link has expired. Please request a new verification email.",
        400,
        { expired: true, email: user.email }
      );
    }

    const updated = await userRepository.update(user.id, {
      emailVerified: true,
      verificationTokenHash: null,
      verificationTokenExpiresAt: null,
    });

    return sanitizeUser(updated);
  },

  /**
   * Resend verification email
   */
  async resendVerification(email) {
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new AuthError("Valid email address is required.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    // Generic response to prevent email enumeration
    if (!user) {
      return {
        message:
          "If an unverified account exists for this email, a verification link has been sent.",
      };
    }

    if (user.emailVerified) {
      return {
        message: "Your account is already verified. You can log in directly.",
        alreadyVerified: true,
      };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(rawToken);
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    await userRepository.update(user.id, {
      verificationTokenHash,
      verificationTokenExpiresAt,
    });

    await emailService.sendVerificationEmail({
      to: normalizedEmail,
      name: user.name,
      token: rawToken,
    });

    return {
      message:
        "If an unverified account exists for this email, a verification link has been sent.",
    };
  },

  /**
   * Login user
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new AuthError("Email and password are required.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new AuthError("Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError("Invalid email or password.", 401);
    }

    if (!user.emailVerified) {
      throw new AuthError("Please verify your email before signing in.", 403, {
        unverified: true,
        email: user.email,
      });
    }

    // Create signed JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || "admin",
      },
      AUTH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email) {
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new AuthError("Please provide a valid email address.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    // Generic security message (prevents account existence discovery)
    const genericResponse = {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };

    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashToken(rawToken);
    const resetTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString(); // 1 hour

    await userRepository.update(user.id, {
      resetTokenHash,
      resetTokenExpiresAt,
    });

    await emailService.sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      token: rawToken,
    });

    return genericResponse;
  },

  /**
   * Reset password using token
   */
  async resetPassword(rawToken, newPassword, confirmPassword) {
    if (!rawToken || typeof rawToken !== "string") {
      throw new AuthError("Reset token is required.", 400);
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      throw new AuthError(pwdError, 400, { field: "newPassword" });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      throw new AuthError("Passwords do not match.", 400, {
        field: "confirmPassword",
      });
    }

    const tokenHash = hashToken(rawToken.trim());
    const user = await userRepository.findByResetTokenHash(tokenHash);

    if (!user) {
      throw new AuthError(
        "Password reset link is invalid or has expired.",
        400
      );
    }

    if (
      user.resetTokenExpiresAt &&
      new Date(user.resetTokenExpiresAt) < new Date()
    ) {
      throw new AuthError(
        "Password reset link has expired. Please request a new link.",
        400
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await userRepository.update(user.id, {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });

    return {
      message: "Password reset successfully. You can now log in.",
    };
  },

  /**
   * Change password for logged in user
   */
  async changePassword(userId, currentPassword, newPassword, confirmPassword) {
    if (!currentPassword || !newPassword) {
      throw new AuthError("Current password and new password are required.", 400);
    }

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AuthError("User not found.", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AuthError("Current password is incorrect.", 400, {
        field: "currentPassword",
      });
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      throw new AuthError(pwdError, 400, { field: "newPassword" });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      throw new AuthError("New passwords do not match.", 400, {
        field: "confirmPassword",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.update(userId, { passwordHash });

    return {
      message: "Password updated successfully.",
    };
  },

  /**
   * Update user profile (Name or Email)
   */
  async updateProfile(userId, { name, email }) {
    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AuthError("User not found.", 404);
    }

    const updates = {};
    let emailChanged = false;

    if (name && typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (
      email &&
      typeof email === "string" &&
      email.trim().toLowerCase() !== user.email
    ) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw new AuthError("Valid email address is required.", 400);
      }

      const duplicate = await userRepository.findByEmail(
        normalizedEmail,
        userId
      );
      if (duplicate) {
        throw new AuthError(
          "This email address is already registered to another account.",
          409
        );
      }

      updates.email = normalizedEmail;
      updates.emailVerified = false;
      emailChanged = true;

      // New verification token for new email
      const rawToken = crypto.randomBytes(32).toString("hex");
      updates.verificationTokenHash = hashToken(rawToken);
      updates.verificationTokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();

      await emailService.sendVerificationEmail({
        to: normalizedEmail,
        name: updates.name || user.name,
        token: rawToken,
      });
    }

    const updated = await userRepository.update(userId, updates);

    return {
      user: sanitizeUser(updated),
      emailChanged,
      message: emailChanged
        ? "Profile updated. A verification email has been sent to your new email address."
        : "Profile updated successfully.",
    };
  },
};

export default authService;
