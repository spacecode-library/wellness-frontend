import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangleIcon, 
  RefreshCwIcon, 
  WifiOffIcon, 
  ServerIcon,
  LockIcon,
  DatabaseIcon
} from 'lucide-react';

/**
 * Enhanced error state component for different types of errors
 */
function ErrorState({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description = "We encountered an error while loading this content.",
  showRetry = true,
  retryLabel = "Try Again",
  retryLoading = false,
  variant = "default"
}) {
  const getErrorIcon = () => {
    if (typeof error === 'string') {
      if (error.includes('network') || error.includes('connection')) return WifiOffIcon;
      if (error.includes('server') || error.includes('500')) return ServerIcon;
      if (error.includes('unauthorized') || error.includes('401')) return LockIcon;
      if (error.includes('database') || error.includes('storage')) return DatabaseIcon;
    }
    
    return AlertTriangleIcon;
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      if (error.includes('network') || error.includes('connection')) {
        return {
          title: "Connection Problem",
          description: "Please check your internet connection and try again."
        };
      }
      if (error.includes('server') || error.includes('500')) {
        return {
          title: "Server Error",
          description: "Our servers are experiencing issues. Please try again in a few moments."
        };
      }
      if (error.includes('unauthorized') || error.includes('401')) {
        return {
          title: "Authentication Required",
          description: "Please log in again to continue."
        };
      }
      if (error.includes('not found') || error.includes('404')) {
        return {
          title: "Content Not Found",
          description: "The requested content could not be found."
        };
      }
    }
    
    return { title, description };
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: "text-center py-8",
          icon: "w-12 h-12 mx-auto mb-4 text-gray-400",
          title: "text-lg font-medium text-gray-900 mb-2",
          description: "text-gray-600 mb-4"
        };
      case 'card':
        return {
          container: "card-glass text-center p-8",
          icon: "w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white",
          title: "text-xl font-semibold text-gray-900 mb-3",
          description: "text-gray-600 mb-6"
        };
      default:
        return {
          container: "text-center p-6",
          icon: "w-14 h-14 mx-auto mb-4 text-red-500",
          title: "text-lg font-semibold text-gray-900 mb-2",
          description: "text-gray-600 mb-5"
        };
    }
  };

  const ErrorIcon = getErrorIcon();
  const { title: errorTitle, description: errorDescription } = getErrorMessage();
  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.container}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={styles.icon}
      >
        <ErrorIcon size={variant === 'card' ? 32 : variant === 'minimal' ? 24 : 28} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={styles.title}>{errorTitle}</h3>
        <p className={styles.description}>{errorDescription}</p>
        
        {showRetry && onRetry && (
          <motion.button
            onClick={onRetry}
            disabled={retryLoading}
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCwIcon 
              size={16} 
              className={retryLoading ? 'animate-spin' : ''} 
            />
            <span>{retryLoading ? 'Retrying...' : retryLabel}</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * Specific error state components for common scenarios
 */
export function NetworkError({ onRetry, retryLoading = false }) {
  return (
    <ErrorState
      error="network connection"
      onRetry={onRetry}
      retryLoading={retryLoading}
      variant="card"
    />
  );
}

export function ServerError({ onRetry, retryLoading = false }) {
  return (
    <ErrorState
      error="server error"
      onRetry={onRetry}
      retryLoading={retryLoading}
      variant="card"
    />
  );
}

export function AuthError({ onRetry }) {
  return (
    <ErrorState
      error="unauthorized"
      onRetry={onRetry}
      retryLabel="Login Again"
      variant="card"
    />
  );
}

export function NotFoundError({ title = "Content Not Found", description = "The requested content could not be found." }) {
  return (
    <ErrorState
      error="not found"
      title={title}
      description={description}
      showRetry={false}
      variant="minimal"
    />
  );
}

export function DataError({ onRetry, retryLoading = false, message = "Failed to load data" }) {
  return (
    <ErrorState
      error={message}
      onRetry={onRetry}
      retryLoading={retryLoading}
      variant="minimal"
    />
  );
}

export default ErrorState;