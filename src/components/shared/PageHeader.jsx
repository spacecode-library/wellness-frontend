import React from 'react';
import { motion } from 'framer-motion';

/**
 * Consistent page header component used across all screens
 */
function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions, 
  gradient = false,
  className = "" 
}) {
  const headerClasses = gradient 
    ? "bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-2xl p-8"
    : "text-center mb-8";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${headerClasses} ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {Icon && (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                gradient 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-sage-100 text-sage-600'
              }`}>
                <Icon size={24} />
              </div>
            )}
            <h1 className={`text-3xl font-bold ${
              gradient ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className={`text-lg ${
              gradient ? 'text-sage-100' : 'text-gray-600'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PageHeader;