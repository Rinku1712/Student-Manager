import { useState } from "react";
import authApi from "../services/authApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const strength = getPasswordStrength(formData.password);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Include at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Include at least one number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    if (name === "password" && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    };

    const hasErrors = Object.values(newErrors).some(Boolean);
    setErrors(newErrors);

    if (hasErrors) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      await authApi.signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setRegisteredEmail(formData.email.trim().toLowerCase());
    } catch (err) {
      console.error("Signup failed:", err);
      if (err.status === 409) {
        setServerError("An account with this email already exists.");
        setErrors((prev) => ({ ...prev, email: "Email already in use" }));
      } else {
        setServerError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check Email screen after successful registration
  if (registeredEmail) {
    return (
      <div className="auth-page-container animate-fade-in-up">
        <div className="auth-card check-email-card">
          <div className="check-email-icon" aria-hidden="true">
            ✉️
          </div>
          <h2>Check your email</h2>
          <p className="auth-subtitle">
            We sent a verification link to:
          </p>
          <div className="highlighted-email">{registeredEmail}</div>
          <p className="check-email-instruction">
            Please click the link inside the message to verify your email address and activate your account.
          </p>

          <div className="auth-actions">
            <button
              type="button"
              className="primary-button full-width"
              onClick={() => onNavigate("login")}
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container animate-fade-in-up">
      <div className="auth-card">
        {/* Brand header */}
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">
            🎓
          </div>
          <p className="eyebrow">Student Management System</p>
          <h2>Create your account</h2>
          <p className="auth-subtitle">
            Create an administrator account to manage student admissions and directory records.
          </p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Full Name */}
          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="signup-name">
              <span>Full Name *</span>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={errors.name ? "input-error" : ""}
                aria-invalid={Boolean(errors.name)}
                disabled={isSubmitting}
                required
              />
            </label>
            {errors.name && (
              <span className="field-error-text" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="signup-email">
              <span>Email Address *</span>
              <input
                id="signup-email"
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
            <label className="form-field" htmlFor="signup-password">
              <span>Password *</span>
              <div className="password-input-wrap">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
            </label>
            {formData.password && (
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
            {errors.password && (
              <span className="field-error-text" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="signup-confirmPassword">
              <span>Confirm Password *</span>
              <div className="password-input-wrap">
                <input
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={errors.confirmPassword ? "input-error" : ""}
                  aria-invalid={Boolean(errors.confirmPassword)}
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
            {errors.confirmPassword && (
              <span className="field-error-text" role="alert">
                {errors.confirmPassword}
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
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate("login")}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
