import { Router } from "express";
import {
  signup,
  verifyEmail,
  resendVerification,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from "../controllers/authController.js";
import {
  authenticateUser,
  authRateLimiter,
} from "../middleware/authMiddleware.js";

const router = Router();

// Public auth endpoints
router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);

router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", authRateLimiter, resendVerification);

router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

// Protected auth endpoints (require active, verified session)
router.get("/me", authenticateUser, getMe);
router.post("/change-password", authenticateUser, changePassword);
router.put("/profile", authenticateUser, updateProfile);

export default router;
