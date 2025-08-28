import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

/**
 * Consistent statistics card component
 */
function StatCard({ 
  title, 
  value, 
  label, 
  icon: Icon, 
  trend,
  trendValue,
  delay = 0,
  className = "" 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`stats-card ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {Icon && <Icon size={20} className="text-sage-600" />}
      </div>
      
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
      
      {trend && trendValue && (
        <div className={`stats-change ${trend === 'up' ? 'positive' : 'negative'}`}>
          {trend === 'up' ? (
            <TrendingUpIcon size={16} />
          ) : (
            <TrendingDownIcon size={16} />
          )}
          {trendValue}
        </div>
      )}
    </motion.div>
  );
}

export default StatCard;