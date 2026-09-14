function NotFound({ onNavigate }) {
  return (
    <div className="not-found-page" role="region" aria-label="Page Not Found">
      <div className="not-found-card">
        <span className="not-found-code" aria-hidden="true">404</span>
        <h2>Page Not Found</h2>
        <p className="muted-copy">
          The view or route you are looking for doesn't exist in the Student Management System.
        </p>
        <button
          type="button"
          className="primary-button not-found-btn"
          onClick={() => onNavigate("dashboard")}
        >
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
