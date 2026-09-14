import authService from "../services/authService.js";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    const user = await authService.verifyEmail(token);
    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.body.email);
    res.status(200).json({
      success: true,
      message: result.message,
      alreadyVerified: Boolean(result.alreadyVerified),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.cookie("token", result.token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    const result = await authService.resetPassword(
      token,
      req.body.newPassword,
      req.body.confirmPassword
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
      req.body.confirmPassword
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.user,
      emailChanged: result.emailChanged,
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
