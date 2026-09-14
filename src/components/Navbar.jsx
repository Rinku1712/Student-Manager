import { useState } from "react";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function Navbar({ currentPage, onNavigate, theme = "light", setTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        {/* Brand */}
        <div className="brand-group">
          <div
            className="brand-mark"
            aria-hidden="true"
            onClick={() => handleNavClick("dashboard")}
            style={{ cursor: "pointer" }}
            title="Go to Dashboard"
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
            onClick={() => handleNavClick("dashboard")}
            style={{ cursor: "pointer" }}
          >
            <p className="eyebrow">Administration Portal</p>
            <h1>Student Management System</h1>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
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
            className={`nav-link nav-link-register ${currentPage === "register" ? "nav-link-register-active" : ""}`}
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

        {/* Topbar Controls & Meta */}
        <div className="topbar-meta">
          {/* Dark / Light Mode Toggle Button */}
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

          <div className="meta-pill">
            <span className="status-dot" aria-hidden="true" />
            <span>Academic Year 2025/26</span>
          </div>

          <div className="meta-date">
            <span className="calendar-icon" aria-hidden="true">📅</span>
            <span>{formatDate(new Date())}</span>
          </div>

          {/* Mobile Hamburger Toggle Button */}
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

            <div className="mobile-nav-links">
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
                className={`mobile-nav-item ${currentPage === "settings" ? "active" : ""}`}
                onClick={() => handleNavClick("settings")}
              >
                <span className="nav-icon" aria-hidden="true">⚙️</span>
                <span>Settings</span>
              </button>
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
