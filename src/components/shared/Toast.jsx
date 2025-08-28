import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastTypes = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangleIcon,
    className: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: InfoIcon,
    className: 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
  },
};

function Toast({ toast, onRemove }) {
  const { type, title, message, duration = 5000 } = toast;
  const { icon: Icon, className, iconColor } = toastTypes[type] || toastTypes.info;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`max-w-md w-full ${className} shadow-xl rounded-xl border backdrop-blur-md p-4 relative overflow-hidden`}
      style={{ minWidth: '320px' }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl" />
      
      <div className="relative flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {title}
            </p>
          )}
          {message && (
            <p className={`text-sm text-gray-700 leading-relaxed break-words ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg focus:outline-none focus:text-gray-600 transition-all duration-200"
            onClick={() => onRemove(toast.id)}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-b-xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3 max-h-screen overflow-hidden">
        <AnimatePresence mode="popLayout">
          {toasts.slice(-5).map((toast, index) => (
            <motion.div
              key={toast.id}
              layout
              style={{ zIndex: 1000 - index }}
              className="relative"
            >
              <Toast
                toast={toast}
                onRemove={removeToast}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default Toast;