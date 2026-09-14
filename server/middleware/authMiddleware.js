import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import userRepository from "../repositories/userRepository.js";
import { sanitizeUser } from "../services/authService.js";

const AUTH_SECRET =
  process.env.AUTH_SECRET || "antigravity_dev_secret_student_portal_2026";

/**
 * Authentication middleware.
 * Verifies JWT from HTTP-only cookie or Authorization header.
 * Attaches sanitized user to req.user.
 */
export async function authenticateUser(req, res, next) {
  try {
    let token = req.cookies?.token;

    // Support Bearer token header fallback
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to continue.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, AUTH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again.",
        details: err.message,
      });
    }

    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session is no longer valid.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address to access this resource.",
        unverified: true,
        email: user.email,
      });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Rate limiter for sensitive auth endpoints (Login, Signup, Reset Password, Resend)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests from this IP. Please try again in 15 minutes.",
  },
});
