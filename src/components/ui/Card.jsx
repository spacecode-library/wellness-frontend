import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Premium Card Component
 * Features glass morphism, hover effects, and multiple variants
 */
const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'default',
  animate = true,
  ...props
}, ref) => {
  const cardVariants = {
    default: 'card-primary',
    glass: 'card-glass',
    elevated: 'bg-white rounded-2xl p-6 shadow-lg',
    flat: 'bg-white rounded-2xl p-6 border border-gray-100',
    gradient: 'bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl p-6 shadow-soft',
  };

  const paddingVariants = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const cardClasses = cn(
    // Base styles
    'relative overflow-hidden',
    
    // Variant styles
    cardVariants[variant],
    
    // Custom padding (overrides variant padding if needed)
    padding !== 'default' && paddingVariants[padding],
    
    // Hover effects
    hover && 'transition-all duration-300 cursor-pointer',
    
    className
  );

  const CardComponent = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
    ...(hover && {
      whileHover: { 
        y: -4,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        transition: { duration: 0.2 }
      },
    }),
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
const CardHeader = ({ children, className, ...props }) => (
  <div 
    className={cn('flex flex-col space-y-1.5 pb-6', className)} 
    {...props}
  >
    {children}
  </div>
);

/**
 * Card Title Component
 */
const CardTitle = ({ children, className, ...props }) => (
  <h3 
    className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)} 
    {...props}
  >
    {children}
  </h3>
);

/**
 * Card Description Component
 */
const CardDescription = ({ children, className, ...props }) => (
  <p 
    className={cn('text-sm text-gray-600', className)} 
    {...props}
  >
    {children}
  </p>
);

/**
 * Card Content Component
 */
const CardContent = ({ children, className, ...props }) => (
  <div 
    className={cn('pt-0', className)} 
    {...props}
  >
    {children}
  </div>
);

/**
 * Card Footer Component
 */
const CardFooter = ({ children, className, ...props }) => (
  <div 
    className={cn('flex items-center pt-6', className)} 
    {...props}
  >
    {children}
  </div>
);

/**
 * Stats Card Component (specialized for wellness metrics)
 */
const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  className,
  ...props 
}) => (
  <Card className={cn('stats-card', className)} {...props}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="stats-label">{title}</p>
        <p className="stats-value">{value}</p>
        {change && (
          <p className={cn('stats-change', changeType)}>
            {changeType === 'positive' ? '↗' : '↘'} {change}
          </p>
        )}
      </div>
      {icon && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center text-sage-600">
            {icon}
          </div>
        </div>
      )}
    </div>
  </Card>
);

export {
  Card as default,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatsCard,
};