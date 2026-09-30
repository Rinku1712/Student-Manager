import { useState } from "react";
import { useAuth } from "../context/useAuth";
import authApi from "../services/authApi";
import Swal from "sweetalert2";

function Login({ onNavigate, redirect = "dashboard" }) {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");
    setUnverifiedEmail("");

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email address is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    setUnverifiedEmail("");

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Navigate to destination
      onNavigate(redirect || "dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      if (err.status === 403 && err.details?.unverified) {
        setUnverifiedEmail(err.details.email || formData.email);
        setServerError("Please verify your email address before signing in.");
      } else {
        setServerError(err.message || "Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail && !formData.email) return;
    const targetEmail = unverifiedEmail || formData.email.trim();

    setIsResending(true);
    try {
      const res = await authApi.resendVerification(targetEmail);
      await Swal.fire({
        title: "Verification Email Sent",
        text: res.message || "A new verification link has been sent to your inbox.",
        icon: "success",
        confirmButtonColor: "#0f766e",
      });
    } catch (err) {
      await Swal.fire({
        title: "Resend Failed",
        text: err.message || "Unable to send verification email.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in-up">
      <div className="auth-card">
        {/* Brand header */}
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">
            🔐
          </div>
          <p className="eyebrow">Student Management System</p>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Sign in to access your administrative dashboard and student records.
          </p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div className="alert-content">
              <p>{serverError}</p>
              {unverifiedEmail && (
                <button
                  type="button"
                  className="resend-inline-btn"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? "Sending link..." : "Resend Verification Email →"}
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email */}
          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="login-email">
              <span>Email Address</span>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={errors.email ? "input-error" : ""}
                aria-invalid={Boolean(errors.email)}
                disabled={isSubmitting}
                required
              />
            </label>
            {errors.email && (
              <span className="field-error-text" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-field-wrapper">
            <div className="field-header-row">
              <label className="form-field-label" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => onNavigate("forgot-password")}
              >
                Forgot password?
              </button>
            </div>
            <div className="password-input-wrap">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? "input-error" : ""}
                aria-invalid={Boolean(errors.password)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className="field-error-text" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="primary-button full-width auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-dots" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate("signup")}
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
