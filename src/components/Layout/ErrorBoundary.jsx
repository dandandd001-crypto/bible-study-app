import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto mt-10 p-4 rounded border bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
          <div className="font-semibold mb-2">Something went wrong.</div>
          <pre className="text-xs overflow-auto">{String(this.state.error?.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
