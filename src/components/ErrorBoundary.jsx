import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (window.confirm("Reset application cache? This will clear locally stored student data.")) {
      localStorage.clear();
      window.location.hash = "dashboard";
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" role="alert">
          <div className="error-boundary-card">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <h2>Something went wrong</h2>
            <p className="muted-copy">
              An unexpected application error occurred. You can reload the page or reset the local cache if the issue persists.
            </p>
            {this.state.error?.message && (
              <pre className="error-message-box">
                {this.state.error.message}
              </pre>
            )}
            <div className="error-actions">
              <button
                type="button"
                className="primary-button"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={this.handleReset}
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
