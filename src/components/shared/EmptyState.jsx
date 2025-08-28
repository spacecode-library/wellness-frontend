import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced empty state component
 */
function EmptyState({ 
  icon = "📭", 
  title = "No data found", 
  description = "There's nothing here yet.", 
  actionLabel,
  onAction,
  className = "",
  size = "default"
}) {
  const sizeClasses = {
    small: "py-8",
    default: "py-16", 
    large: "py-24"
  };

  const iconSizes = {
    small: "text-4xl",
    default: "text-6xl",
    large: "text-8xl"
  };

  const titleSizes = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card-glass text-center ${sizeClasses[size]} ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`${iconSizes[size]} mb-6 float-animation`}
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))' }}
      >
        {icon}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className={`${titleSizes[size]} font-semibold text-gray-900 mb-3 gradient-text`}>
          {title}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        
        {actionLabel && onAction && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onAction}
            className="btn-primary mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {actionLabel}
          </motion.button>
        )}
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-sage-300 rounded-full opacity-30"></div>
      <div className="absolute top-8 right-6 w-1 h-1 bg-sage-400 rounded-full opacity-40"></div>
      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-sage-200 rounded-full opacity-50"></div>
    </motion.div>
  );
}

export default EmptyState;