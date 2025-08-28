import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import NavigationBadge from './NavigationBadge';
import { useSurveyNotificationContext } from '../../contexts/SurveyNotificationContext';
import useAuthStore from '../../store/authStore';

const NavigationItem = ({ 
  item, 
  isActive, 
  hasCheckedInToday, 
  onClose, 
  isMobile = false 
}) => {
  const { user } = useAuthStore();
  const isCheckinItem = item.href === '/employee/checkin';
  const isSurveyItem = item.href === '/employee/surveys';
  
  // Only show survey badges for employees
  const showSurveyBadge = isSurveyItem && user?.role === 'employee';
  
  let surveyNotifications = null;
  
  try {
    if (showSurveyBadge) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      surveyNotifications = useSurveyNotificationContext();
    }
  } catch (error) {
    // Context not available, don't show badge
    console.warn('Survey notification context not available');
  }

  const getSurveyBadgeProps = () => {
    if (!surveyNotifications) return { count: 0 };
    
    const { pendingSurveys, notificationLevel } = surveyNotifications;
    const count = pendingSurveys.length;
    
    if (count === 0) return { count: 0 };
    
    const typeMap = {
      urgent: 'urgent',
      high: 'urgent', 
      medium: 'warning',
      low: 'default'
    };
    
    return {
      count,
      type: typeMap[notificationLevel] || 'default',
      pulsing: notificationLevel === 'urgent'
    };
  };

  const surveyBadgeProps = showSurveyBadge ? getSurveyBadgeProps() : { count: 0 };

  if (isMobile) {
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 relative',
          isActive
            ? 'bg-sage-100 text-sage-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <div className="relative">
          <item.icon size={20} />
          {showSurveyBadge && (
            <NavigationBadge {...surveyBadgeProps} />
          )}
        </div>
        <span className="font-medium">{item.name}</span>
        
        {/* Check-in indicator */}
        {isCheckinItem && (
          <div className={cn(
            'ml-auto w-2 h-2 rounded-full flex-shrink-0',
            hasCheckedInToday ? 'bg-green-400' : 'bg-orange-400'
          )} />
        )}
      </Link>
    );
  }

  return (
    <Link
      key={item.name}
      to={item.href}
      className={cn(
        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative',
        isActive
          ? 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 shadow-sm'
          : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
      )}
    >
      <div className="relative mr-3 flex-shrink-0">
        <item.icon 
          size={18} 
          className={cn(
            isActive ? 'text-sage-700' : 'text-gray-400 group-hover:text-gray-500'
          )} 
        />
        {showSurveyBadge && (
          <NavigationBadge {...surveyBadgeProps} />
        )}
      </div>
      <span className="truncate">{item.name}</span>
      
      {/* Check-in indicator */}
      {isCheckinItem && (
        <div className={cn(
          'ml-auto w-2 h-2 rounded-full flex-shrink-0',
          hasCheckedInToday ? 'bg-green-400' : 'bg-orange-400'
        )} />
      )}
    </Link>
  );
};

export default NavigationItem;