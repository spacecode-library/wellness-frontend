import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'hover:bg-gray-100 text-gray-700',
  link: 'text-sage-600 hover:text-sage-700 underline-offset-4 hover:underline',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
};

/**
 * Premium Button Component
 * Features smooth animations, multiple variants, and accessibility
 */
const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  onClick,
  ...props
}, ref) => {
  const buttonClasses = cn(
    // Base styles
    'inline-flex items-center justify-center font-medium rounded-xl',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-4 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    
    // Variant styles
    buttonVariants[variant],
    
    // Size styles
    buttonSizes[size],
    
    // Full width
    fullWidth && 'w-full',
    
    // Loading state
    loading && 'cursor-wait',
    
    className
  );

  const ButtonComponent = animate ? motion.button : 'button';
  
  const motionProps = animate ? {
    whileHover: disabled || loading ? {} : { scale: 1.02, y: -1 },
    whileTap: disabled || loading ? {} : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
  } : {};

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <ButtonComponent
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...motionProps}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="loading-spinner mr-2" />
      )}
      
      {/* Left icon */}
      {icon && iconPosition === 'left' && !loading && (
        <span className={cn('flex-shrink-0', children && 'mr-2')}>
          {icon}
        </span>
      )}
      
      {/* Button text */}
      {children && (
        <span className={loading ? 'ml-2' : ''}>
          {children}
        </span>
      )}
      
      {/* Right icon */}
      {icon && iconPosition === 'right' && !loading && (
        <span className={cn('flex-shrink-0', children && 'ml-2')}>
          {icon}
        </span>
      )}
    </ButtonComponent>
  );
});

Button.displayName = 'Button';

export default Button;