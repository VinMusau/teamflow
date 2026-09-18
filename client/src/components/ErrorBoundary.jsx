import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
          <div className="w-full max-w-md rounded-2xl border border-red-900 bg-slate-900 p-6 text-slate-200">
            <h1 className="text-lg font-semibold text-red-400">
              Something broke
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              We hit an unexpected error. You can try reloading or going back
              to the dashboard.
            </p>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-red-300">
              {this.state.error.message}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                onClick={this.handleReset}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
              >
                Try again
              </button>
              <a
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}