import { useState } from "react";
import { useAuth } from "../context/useAuth";
import authApi from "../services/authApi";
import { getInitials } from "../utils/studentUtils";
import Swal from "sweetalert2";

function Profile({ onNavigate }) {
  const { user, setUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) {
    return (
      <div className="auth-page-container">
        <p>Please log in to view your profile.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => onNavigate("login")}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const initials = getInitials(
    user.name?.split(" ")[0] || "A",
    user.name?.split(" ")[1] || "U"
  );

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire({
        title: "Name Required",
        text: "Please enter your name.",
        icon: "warning",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });

      if (res.data) {
        setUser(res.data);
      }

      if (res.emailChanged) {
        await Swal.fire({
          title: "Verification Email Sent",
          text: "Your email has been updated. Please verify your new email address to maintain full account access.",
          icon: "info",
          confirmButtonColor: "#0f766e",
        });
      } else {
        await Swal.fire({
          title: "Profile Updated",
          text: "Your account profile was updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Failed to update profile.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      Swal.fire({
        title: "Current Password Required",
        text: "Please enter your current password to confirm changes.",
        icon: "warning",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire({
        title: "Weak Password",
        text: "New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.",
        icon: "warning",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Password Mismatch",
        text: "New password and confirmation do not match.",
        icon: "warning",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await Swal.fire({
        title: "Password Changed",
        text: "Your password has been updated securely.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Change Failed",
        text: err.message || "Failed to update password. Verify your current password is correct.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="profile-page animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Account Security</p>
          <h2>User Profile & Access</h2>
          <p className="muted-copy">
            Manage your administrator credentials, email notifications, and password security.
          </p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Profile Card / Overview */}
        <section className="profile-card profile-overview-card">
          <div className="profile-avatar-large" aria-hidden="true">
            {initials}
          </div>
          <h3>{user.name}</h3>
          <p className="profile-user-email">{user.email}</p>

          <div className="profile-meta-tags">
            <span className="role-pill role-admin">
              🛡️ {user.role ? user.role.toUpperCase() : "ADMIN"}
            </span>
            <span
              className={`status-pill ${
                user.emailVerified ? "status-active" : "status-inactive"
              }`}
            >
              <span className="status-indicator" aria-hidden="true" />
              {user.emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-row">
              <span>Account ID</span>
              <strong>{user.id}</strong>
            </div>
            <div className="profile-detail-row">
              <span>Member Since</span>
              <strong>
                {user.createdAt
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(user.createdAt))
                  : "N/A"}
              </strong>
            </div>
          </div>
        </section>

        {/* Edit Forms Container */}
        <div className="profile-forms-column">
          {/* Section 1: Update Account Information */}
          <section className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
            </div>
            <p className="muted-copy" style={{ marginBottom: "1.25rem" }}>
              Update your display name and email address. Changing your email address will require email re-verification.
            </p>

            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-grid two-columns">
                <div className="form-field-wrapper">
                  <label className="form-field" htmlFor="profile-name">
                    <span>Full Name</span>
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field" htmlFor="profile-email">
                    <span>Email Address</span>
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="profile-actions-bar">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </section>

          {/* Section 2: Change Password */}
          <section className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Change Password</h3>
            </div>
            <p className="muted-copy" style={{ marginBottom: "1.25rem" }}>
              Ensure your account uses a secure password containing uppercase, lowercase, and numbers.
            </p>

            <form onSubmit={handleChangePassword} className="profile-edit-form">
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="prof-current-password">
                  <span>Current Password</span>
                  <input
                    id="prof-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </label>
              </div>

              <div className="form-grid two-columns">
                <div className="form-field-wrapper">
                  <label className="form-field" htmlFor="prof-new-password">
                    <span>New Password</span>
                    <input
                      id="prof-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                    />
                  </label>
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field" htmlFor="prof-confirm-password">
                    <span>Confirm New Password</span>
                    <input
                      id="prof-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="profile-actions-bar">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
