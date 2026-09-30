import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { getInitials } from "../utils/studentUtils";
import Swal from "sweetalert2";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function Navbar({ currentPage, onNavigate, theme = "light", setTheme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);

    const result = await Swal.fire({
      title: "Sign Out?",
      text: "Are you sure you want to end your administrative session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sign Out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await logout();
      onNavigate("login");
      await Swal.fire({
        title: "Signed Out",
        text: "You have been logged out successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const userInitials = user
    ? getInitials(user.name?.split(" ")[0] || "A", user.name?.split(" ")[1] || "U")
    : "AU";

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        {/* Brand */}
        <div className="brand-group">
          <div
            className="brand-mark"
            aria-hidden="true"
            onClick={() => handleNavClick(isAuthenticated ? "dashboard" : "login")}
            style={{ cursor: "pointer" }}
            title="Student Management"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div
            className="brand-text"
            onClick={() => handleNavClick(isAuthenticated ? "dashboard" : "login")}
            style={{ cursor: "pointer" }}
          >
            <p className="eyebrow">Administration Portal</p>
            <h1>Student Management System</h1>
          </div>
        </div>

        {/* Desktop Navigation Tabs (shown when authenticated) */}
        {isAuthenticated && (
          <nav className="nav-tabs desktop-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-link ${currentPage === "dashboard" ? "nav-link-active" : ""}`}
              onClick={() => handleNavClick("dashboard")}
              aria-current={currentPage === "dashboard" ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">📊</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`nav-link ${currentPage === "students" ? "nav-link-active" : ""}`}
              onClick={() => handleNavClick("students")}
              aria-current={currentPage === "students" ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">👥</span>
              <span>Students</span>
            </button>

            <button
              type="button"
              className={`nav-link nav-link-register ${
                currentPage === "register" ? "nav-link-register-active" : ""
              }`}
              onClick={() => handleNavClick("register")}
              aria-current={currentPage === "register" ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">+</span>
              <span>Register Student</span>
            </button>

            <button
              type="button"
              className={`nav-link ${currentPage === "settings" ? "nav-link-active" : ""}`}
              onClick={() => handleNavClick("settings")}
              aria-current={currentPage === "settings" ? "page" : undefined}
              title="Settings"
            >
              <span className="nav-icon" aria-hidden="true">⚙️</span>
              <span>Settings</span>
            </button>
          </nav>
        )}

        {/* Topbar Meta (Date) */}
        <div className="topbar-meta date-chip">
          <div className="meta-date">
            <span className="calendar-icon" aria-hidden="true">📅</span>
            <span>{formatDate(new Date())}</span>
          </div>
        </div>

        {/* Topbar Actions (Always accessible) */}
        <div className="topbar-actions">
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <span aria-hidden="true">☀️</span>
            ) : (
              <span aria-hidden="true">🌙</span>
            )}
          </button>

          {/* User Account / Dropdown or Sign In / Sign Up */}
          {isAuthenticated ? (
            <div className="user-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className="user-nav-trigger-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <span className="user-nav-avatar">{userInitials}</span>
                <span className="user-nav-name">{user?.name?.split(" ")[0] || "Admin"}</span>
                <span className="user-nav-chevron" aria-hidden="true">▾</span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu animate-scale-in" role="menu">
                  <div className="user-dropdown-header">
                    <strong>{user?.name}</strong>
                    <small>{user?.email}</small>
                    <span className="role-pill-small">
                      🛡️ {user?.role ? user.role.toUpperCase() : "ADMIN"}
                    </span>
                  </div>

                  <div className="user-dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-menu-item"
                    role="menuitem"
                    onClick={() => handleNavClick("profile")}
                  >
                    <span aria-hidden="true">👤</span>
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-menu-item"
                    role="menuitem"
                    onClick={() => handleNavClick("settings")}
                  >
                    <span aria-hidden="true">⚙️</span>
                    <span>Settings</span>
                  </button>

                  <div className="user-dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-menu-item text-danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span aria-hidden="true">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="unauth-nav-buttons">
              <button
                type="button"
                className="secondary-button nav-signin-btn"
                onClick={() => handleNavClick("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className="primary-button nav-signup-btn"
                onClick={() => handleNavClick("signup")}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          {isAuthenticated && (
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
              <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        >
          <nav
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation"
          >
            <div className="mobile-drawer-header">
              <span className="drawer-title">Navigation Menu</span>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                &times;
              </button>
            </div>

            {isAuthenticated && (
              <div className="mobile-user-profile-header">
                <span className="avatar-large-mobile">{userInitials}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.email}</small>
                </div>
              </div>
            )}

            <div className="mobile-nav-links">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "dashboard" ? "active" : ""}`}
                    onClick={() => handleNavClick("dashboard")}
                  >
                    <span className="nav-icon" aria-hidden="true">📊</span>
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "students" ? "active" : ""}`}
                    onClick={() => handleNavClick("students")}
                  >
                    <span className="nav-icon" aria-hidden="true">👥</span>
                    <span>Students</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "register" ? "active" : ""}`}
                    onClick={() => handleNavClick("register")}
                  >
                    <span className="nav-icon" aria-hidden="true">➕</span>
                    <span>Register Student</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "profile" ? "active" : ""}`}
                    onClick={() => handleNavClick("profile")}
                  >
                    <span className="nav-icon" aria-hidden="true">👤</span>
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "settings" ? "active" : ""}`}
                    onClick={() => handleNavClick("settings")}
                  >
                    <span className="nav-icon" aria-hidden="true">⚙️</span>
                    <span>Settings</span>
                  </button>

                  <button
                    type="button"
                    className="mobile-nav-item text-danger"
                    onClick={handleLogout}
                  >
                    <span className="nav-icon" aria-hidden="true">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "login" ? "active" : ""}`}
                    onClick={() => handleNavClick("login")}
                  >
                    <span className="nav-icon" aria-hidden="true">🔐</span>
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className={`mobile-nav-item ${currentPage === "signup" ? "active" : ""}`}
                    onClick={() => handleNavClick("signup")}
                  >
                    <span className="nav-icon" aria-hidden="true">🎓</span>
                    <span>Create Account</span>
                  </button>
                </>
              )}
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="secondary-button mobile-theme-btn"
                onClick={toggleTheme}
              >
                {theme === "dark" ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
              </button>
              <div className="mobile-meta-text">
                Academic Year 2025/26 • {formatDate(new Date())}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
