import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from 'lucide-react';
import Button from './Button';

/**
 * Error Boundary Class Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,  
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Optionally reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return <ErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
      />;
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * Displays when an error is caught by the ErrorBoundary
 */
function ErrorFallback({ error, onRetry, onGoHome }) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Icon */}
        <motion.div
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <AlertTriangleIcon size={40} className="text-red-600" />
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            We're sorry for the inconvenience. The wellness platform encountered an unexpected error.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetry}
              variant="primary"
              icon={<RefreshCwIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Try Again
            </Button>
            
            <Button
              onClick={onGoHome}
              variant="outline"
              icon={<HomeIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Go Home
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            If the problem persists, please contact our support team.
          </p>
        </motion.div>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <motion.details
            className="mt-8 text-left bg-gray-100 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <div className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
              <div className="mb-2">
                <strong>Error:</strong> {error.toString()}
              </div>
              <div>
                <strong>Stack Trace:</strong>
                <pre className="mt-1 text-xs overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </div>
            </div>
          </motion.details>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  return (error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // You can dispatch to an error reporting service here
    // Example: reportError(error, errorInfo);
  };
}

/**
 * Higher-Order Component for wrapping components with error boundary
 */
export function withErrorBoundary(Component, errorFallback) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;