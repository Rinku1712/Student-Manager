import { useState } from "react";
import authApi from "../services/authApi";

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      // Still show success or friendly generic message to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in-up">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">
            🔑
          </div>
          <p className="eyebrow">Account Recovery</p>
          <h2>Reset your password</h2>
          <p className="auth-subtitle">
            Enter the email address associated with your account and we will send you a secure password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="auth-state-wrap animate-fade-in-up">
            <div className="verify-icon verify-icon-success" aria-hidden="true">
              ✉️
            </div>
            <h3>Check your email</h3>
            <p className="auth-subtitle" style={{ marginTop: "0.5rem" }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
            </p>
            <p className="check-email-instruction">
              The link is valid for <strong>1 hour</strong>. Check your spam folder if you don't see it in your inbox.
            </p>

            <button
              type="button"
              className="primary-button full-width"
              style={{ marginTop: "1.5rem" }}
              onClick={() => onNavigate("login")}
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {error && (
              <div className="auth-alert auth-alert-error" role="alert">
                <span className="alert-icon" aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="forgot-email">
                <span>Email Address</span>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@example.com"
                  disabled={isSubmitting}
                  required
                />
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
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="auth-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => onNavigate("login")}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
