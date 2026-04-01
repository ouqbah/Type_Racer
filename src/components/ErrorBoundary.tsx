import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-200">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-900/30 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">Something went wrong</h2>
            <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-lg overflow-auto text-sm text-red-800 dark:text-red-400 font-mono mb-4 border border-red-100 dark:border-red-500/20">
              {this.state.error?.message}
            </div>
            <button
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
