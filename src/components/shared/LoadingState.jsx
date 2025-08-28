import React from 'react';
import { motion } from 'framer-motion';

// Skeleton components for different layouts
export function SkeletonCard() {
  return (
    <div className="card-glass animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full skeleton"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded skeleton mb-2"></div>
          <div className="h-3 bg-gray-200 rounded skeleton w-2/3"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded skeleton"></div>
        <div className="h-3 bg-gray-200 rounded skeleton w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded skeleton w-4/6"></div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="stats-card animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded skeleton mb-4"></div>
          <div className="h-8 bg-gray-200 rounded skeleton mb-2"></div>
          <div className="h-4 bg-gray-200 rounded skeleton w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="card-glass animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded skeleton"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded skeleton mb-2"></div>
              <div className="h-3 bg-gray-200 rounded skeleton w-2/3"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Enhanced loading state component with skeleton options
 */
function LoadingState({ 
  message = "Loading...", 
  size = "default", 
  type = "spinner",
  centered = true,
  className = "" 
}) {
  const sizeClasses = {
    small: "py-4",
    default: "py-12",
    large: "py-20"
  };

  const spinnerSizes = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-20 h-20"
  };

  if (type === 'skeleton-card') {
    return <SkeletonCard />;
  }

  if (type === 'skeleton-stats') {
    return <SkeletonStats />;
  }

  if (type === 'skeleton-list') {
    return <SkeletonList />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`${centered ? 'text-center' : ''} ${sizeClasses[size]} ${className}`}
    >
      <div className="relative mb-6">
        <div className={`loading-spinner ${spinnerSizes[size]} ${centered ? 'mx-auto' : ''}`}></div>
        {/* Removed ping animation to reduce flashing */}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <p className="text-gray-700 text-lg font-medium">{message}</p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LoadingState;