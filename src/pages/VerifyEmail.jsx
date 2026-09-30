import { useState, useEffect } from "react";
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

function VerifyEmail({ onNavigate }) {
  const token = getQueryParam("token");
  const [status, setStatus] = useState(() => (token ? "verifying" : "idle"));
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function executeVerification() {
      try {
        const res = await authApi.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
          setMessage(res.message || "Your email address has been verified successfully!");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setMessage(err.message || "Verification link is invalid or has expired.");
          if (err.details?.email) {
            setResendEmail(err.details.email);
          }
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    if (!resendEmail.trim()) {
      Swal.fire({
        title: "Email Required",
        text: "Please enter your email address.",
        icon: "warning",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    setIsResending(true);
    try {
      const res = await authApi.resendVerification(resendEmail.trim().toLowerCase());
      await Swal.fire({
        title: "Verification Sent",
        text: res.message || "A new verification link has been sent to your email.",
        icon: "success",
        confirmButtonColor: "#0f766e",
      });
    } catch (err) {
      await Swal.fire({
        title: "Resend Failed",
        text: err.message || "Failed to resend verification email.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page-container animate-fade-in-up">
      <div className="auth-card verify-email-card">
        {status === "verifying" && (
          <div className="verify-state-wrap">
            <div className="spinner-dots verify-spinner" aria-hidden="true" />
            <h2>Verifying your email</h2>
            <p className="auth-subtitle">
              Please wait while we validate your verification token...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="verify-state-wrap">
            <div className="verify-icon verify-icon-success" aria-hidden="true">
              ✅
            </div>
            <h2>Email verified successfully!</h2>
            <p className="auth-subtitle">{message}</p>
            <p className="check-email-instruction">
              Your account is now fully active. You can proceed to sign in to your dashboard.
            </p>
            <div className="auth-actions">
              <button
                type="button"
                className="primary-button full-width"
                onClick={() => onNavigate("login")}
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="verify-state-wrap">
            <div className="verify-icon verify-icon-error" aria-hidden="true">
              ⚠️
            </div>
            <h2>Verification failed</h2>
            <p className="auth-subtitle">{message}</p>

            <div className="resend-form-container">
              <p className="resend-lead">Need a new verification link?</p>
              <form onSubmit={handleResend} className="resend-form">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={isResending}
                >
                  {isResending ? "Sending..." : "Resend Link"}
                </button>
              </form>
            </div>

            <div className="auth-actions">
              <button
                type="button"
                className="link-button back-to-login-link"
                onClick={() => onNavigate("login")}
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="verify-state-wrap">
            <div className="verify-icon" aria-hidden="true">
              ✉️
            </div>
            <h2>Resend Verification Email</h2>
            <p className="auth-subtitle">
              Enter your email address below to receive a new account verification link.
            </p>

            <form onSubmit={handleResend} className="auth-form" style={{ marginTop: "1.5rem" }}>
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="resend-input-email">
                  <span>Email Address</span>
                  <input
                    id="resend-input-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="primary-button full-width"
                disabled={isResending}
              >
                {isResending ? "Sending Link..." : "Send Verification Email"}
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
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
