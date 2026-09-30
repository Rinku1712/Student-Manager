import { useState } from "react";
import authApi from "../services/authApi";
import Swal from "sweetalert2";

function getQueryParam(name) {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has(name)) return searchParams.get(name);

  const hash = window.location.hash;
  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const hashParams = new URLSearchParams(hash.slice(qIndex));
    return hashParams.get(name);
  }
  return "";
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: "Weak", color: "var(--accent-rose, #dc2626)" };
  if (score === 3) return { score: 2, label: "Fair", color: "var(--accent-amber, #d97706)" };
  if (score === 4) return { score: 3, label: "Good", color: "var(--accent-blue, #2563eb)" };
  return { score: 4, label: "Strong", color: "var(--accent-emerald, #059669)" };
}

function ResetPassword({ onNavigate }) {
  const [token] = useState(() => getQueryParam("token"));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Missing or invalid password reset token.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await authApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      await Swal.fire({
        title: "Password Reset Successfully",
        text: res.message || "You can now log in using your new password.",
        icon: "success",
        confirmButtonColor: "#0f766e",
      });

      onNavigate("login");
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page-container animate-fade-in-up">
        <div className="auth-card">
          <div className="verify-state-wrap">
            <div className="verify-icon verify-icon-error" aria-hidden="true">
              ⚠️
            </div>
            <h2>Invalid Reset Link</h2>
            <p className="auth-subtitle">
              No reset token was found in the link. Please request a new password reset link.
            </p>
            <button
              type="button"
              className="primary-button full-width"
              style={{ marginTop: "1.5rem" }}
              onClick={() => onNavigate("forgot-password")}
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container animate-fade-in-up">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">
            🛡️
          </div>
          <p className="eyebrow">Security Access</p>
          <h2>Create New Password</h2>
          <p className="auth-subtitle">
            Choose a strong password with at least 8 characters, an uppercase letter, and a number.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="reset-new-password">
              <span>New Password</span>
              <div className="password-input-wrap">
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Min 8 characters"
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
            </label>

            {newPassword && (
              <div className="password-strength-bar-wrap">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className="strength-step"
                      style={{
                        backgroundColor:
                          strength.score >= step ? strength.color : "var(--bg-muted, #e2e8f0)",
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="reset-confirm-password">
              <span>Confirm New Password</span>
              <div className="password-input-wrap">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="primary-button full-width auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-dots" aria-hidden="true" />
                <span>Resetting Password...</span>
              </>
            ) : (
              "Save New Password"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate("login")}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
