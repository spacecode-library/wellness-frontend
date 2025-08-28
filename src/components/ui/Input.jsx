import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Premium Input Component
 * Features floating labels, validation states, and smooth animations
 */
const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  animate = true,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState(props.value || props.defaultValue || '');

  const inputSizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const inputVariants = {
    default: 'input-primary',
    outline: 'border-2 border-gray-200 rounded-xl focus:border-sage-300 focus:ring-4 focus:ring-sage-300/20',
    filled: 'bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-sage-300 focus:ring-4 focus:ring-sage-300/20',
    underline: 'border-0 border-b-2 border-gray-200 rounded-none focus:border-sage-300 focus:ring-0 bg-transparent',
  };

  const hasValue = value.length > 0;
  const actualType = type === 'password' && showPassword ? 'text' : type;

  const inputClasses = cn(
    // Base styles
    'w-full transition-all duration-200 ease-out placeholder-gray-400',
    'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Size styles
    inputSizes[size],
    
    // Variant styles
    inputVariants[variant],
    
    // Icon padding
    icon && iconPosition === 'left' && 'pl-10',
    icon && iconPosition === 'right' && 'pr-10',
    
    // Password toggle padding
    showPasswordToggle && 'pr-10',
    
    // Error state
    error && 'border-red-300 focus:border-red-300 focus:ring-red-300/20',
    
    // Success state
    success && 'border-green-300 focus:border-green-300 focus:ring-green-300/20',
    
    className
  );

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const handleFocus = (e) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const InputComponent = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  } : {};

  return (
    <InputComponent className="relative" {...motionProps}>
      {/* Label */}
      {label && (
        <motion.label
          className={cn(
            'block text-sm font-medium mb-2 transition-colors duration-200',
            focused || hasValue ? 'text-sage-600' : 'text-gray-700',
            error && 'text-red-600',
            success && 'text-green-600'
          )}
          animate={animate ? {
            scale: focused || hasValue ? 0.95 : 1,
          } : {}}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={actualType}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}

        {/* Focus Ring Animation */}
        {animate && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-sage-300 pointer-events-none"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{
              opacity: focused ? 0.3 : 0,
              scale: focused ? 1 : 1.02,
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600"
          initial={animate ? { opacity: 0, y: -5 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}

      {/* Success Message */}
      {success && (
        <motion.p
          className="mt-2 text-sm text-green-600"
          initial={animate ? { opacity: 0, y: -5 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
        >
          {success}
        </motion.p>
      )}
    </InputComponent>
  );
});

Input.displayName = 'Input';

/**
 * Textarea Component
 */
const Textarea = React.forwardRef(({
  className,
  label,
  error,
  success,
  required = false,
  rows = 4,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.value || props.defaultValue || '');

  const textareaClasses = cn(
    'w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical',
    'focus:border-sage-300 focus:ring-4 focus:ring-sage-300/20 focus:outline-none',
    'transition-all duration-200 ease-out placeholder-gray-400',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error && 'border-red-300 focus:border-red-300 focus:ring-red-300/20',
    success && 'border-green-300 focus:border-green-300 focus:ring-green-300/20',
    className
  );

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const handleFocus = (e) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-2 transition-colors duration-200',
          focused ? 'text-sage-600' : 'text-gray-700',
          error && 'text-red-600',
          success && 'text-green-600'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Success Message */}
      {success && (
        <p className="mt-2 text-sm text-green-600">{success}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input as default, Textarea };