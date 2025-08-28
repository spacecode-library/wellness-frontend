import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationBadge = ({ count = 0, type = 'default', pulsing = false }) => {
  if (count === 0) return null;

  const getStylesForType = (type) => {
    const styles = {
      default: 'bg-blue-500 text-white',
      urgent: 'bg-red-500 text-white',
      warning: 'bg-orange-500 text-white',
      success: 'bg-green-500 text-white'
    };
    return styles[type] || styles.default;
  };

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`
          absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center
          text-xs font-medium z-10 border-2 border-white
          ${getStylesForType(type)}
          ${pulsing ? 'animate-pulse' : ''}
        `}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    </AnimatePresence>
  );
};

export default NavigationBadge;