import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info?.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen grid place-items-center p-6 bg-surface-50"
        >
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-surface-700">
              Please reload the page. If the problem persists, contact support.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
