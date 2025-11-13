import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'app' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service
    this.logError(error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    // Store error in localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
      };

      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAppLevel = this.props.level === 'app';

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8E4DF] via-[#F5F3F0] to-[#E8E4DF] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/80 backdrop-blur-md border border-[#E8A587]/20 rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-gray-900 mb-2">
                  {isAppLevel ? 'Application Error' : 'Something went wrong'}
                </h1>
                
                <p className="text-gray-600 mb-4">
                  {isAppLevel
                    ? 'We encountered an unexpected error. Your data is safe, but the application needs to restart.'
                    : 'This section encountered an error. You can try refreshing it or continue using other parts of the app.'}
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <summary className="cursor-pointer text-sm text-gray-700 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Error Message:</p>
                        <code className="text-xs text-red-600 block bg-red-50 p-2 rounded">
                          {this.state.error.message}
                        </code>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Stack Trace:</p>
                          <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex flex-wrap gap-3">
                  {!isAppLevel && (
                    <button
                      onClick={this.handleReset}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8A587] text-white rounded-lg hover:bg-[#D4956F] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  )}
                  
                  {isAppLevel && (
                    <button
                      onClick={this.handleReload}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8A587] text-white rounded-lg hover:bg-[#D4956F] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reload App
                    </button>
                  )}

                  <button
                    onClick={this.handleGoHome}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Go to Home
                  </button>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  If this problem persists, try clearing your browser cache or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for component-level errors
export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary level="component">
      {children}
    </ErrorBoundary>
  );
};

// Export error log viewer for Settings page
export const ErrorLogViewer: React.FC = () => {
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      setLogs(errorLogs.reverse());
    } catch (e) {
      console.error('Failed to load error logs:', e);
    }
  }, []);

  const clearLogs = () => {
    localStorage.removeItem('error_logs');
    setLogs([]);
  };

  if (logs.length === 0) {
    return (
      <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl">
        <p className="text-gray-600 text-center">No error logs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-900">Error Logs ({logs.length})</h3>
        <button
          onClick={clearLogs}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <details
            key={index}
            className="p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl"
          >
            <summary className="cursor-pointer text-sm">
              <span className="text-red-600">{log.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </summary>
            <pre className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {log.stack || 'No stack trace available'}
            </pre>
          </details>
        ))}
      </div>
    </div>
  );
};
