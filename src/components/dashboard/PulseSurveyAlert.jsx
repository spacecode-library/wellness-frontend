import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertTriangleIcon, 
  ClockIcon, 
  ArrowRightIcon,
  XIcon,
  BarChart3Icon
} from 'lucide-react';
import useSurveyNotifications from '../../hooks/useSurveyNotifications';

const PulseSurveyAlert = ({ onDismiss }) => {
  const {
    pendingSurveys,
    overdueSurveys,
    urgentSurveys,
    notificationLevel,
    getDaysOverdue,
    getUrgencyLevel,
    loading
  } = useSurveyNotifications();

  if (loading || notificationLevel === 'none') return null;

  const getAlertContent = () => {
    const urgentCount = urgentSurveys.length;
    const overdueCount = overdueSurveys.length;
    const totalCount = pendingSurveys.length;

    if (urgentCount > 0) {
      return {
        title: '🚨 Urgent Pulse Survey Alert!',
        message: `You have ${urgentCount} urgent survey${urgentCount > 1 ? 's' : ''} requiring immediate attention.`,
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        icon: AlertTriangleIcon,
        iconColor: 'text-red-600'
      };
    } else if (overdueCount > 0) {
      return {
        title: '⚠️ Overdue Pulse Surveys',
        message: `${overdueCount} survey${overdueCount > 1 ? 's are' : ' is'} overdue. Please complete them soon.`,
        bgColor: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-800',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        icon: ClockIcon,
        iconColor: 'text-orange-600'
      };
    } else {
      return {
        title: '📊 New Pulse Surveys Available',
        message: `${totalCount} pulse survey${totalCount > 1 ? 's are' : ' is'} waiting for your feedback.`,
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',  
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        icon: BarChart3Icon,
        iconColor: 'text-blue-600'
      };
    }
  };

  const alertContent = getAlertContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`relative p-4 rounded-lg border-2 ${alertContent.bgColor} mb-6`}
      >
        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
          >
            <XIcon size={16} className={alertContent.textColor} />
          </button>
        )}

        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <alertContent.icon size={24} className={alertContent.iconColor} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${alertContent.textColor} mb-1`}>
              {alertContent.title}
            </h3>
            <p className={`${alertContent.textColor} opacity-90 mb-3`}>
              {alertContent.message}
            </p>

            {/* Survey details */}
            {pendingSurveys.length > 0 && (
              <div className="space-y-2 mb-4">
                {pendingSurveys.slice(0, 3).map((survey) => {
                  const daysOverdue = getDaysOverdue(survey);
                  const urgencyLevel = getUrgencyLevel(survey);
                  
                  return (
                    <div key={survey._id} className="flex items-center justify-between bg-white bg-opacity-50 p-2 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{survey.title}</div>
                        <div className="text-xs opacity-75">
                          {daysOverdue > 0 ? (
                            <span className="text-red-600 font-medium">
                              {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                            </span>
                          ) : survey.dueDate ? (
                            `Due ${new Date(survey.dueDate).toLocaleDateString()}`
                          ) : (
                            'No due date set'
                          )}
                        </div>
                      </div>
                      {urgencyLevel === 'urgent' && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          Urgent
                        </span>
                      )}
                    </div>
                  );
                })}
                
                {pendingSurveys.length > 3 && (
                  <div className="text-center text-sm opacity-75">
                    +{pendingSurveys.length - 3} more survey{pendingSurveys.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Action button */}
            <Link
              to="/employee/surveys"
              className={`inline-flex items-center space-x-2 px-4 py-2 ${alertContent.buttonColor} text-white rounded-lg font-medium transition-colors`}
            >
              <span>Complete Surveys</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>

        {/* Animated border for urgent surveys */}
        {notificationLevel === 'urgent' && (
          <motion.div
            className="absolute inset-0 border-2 border-red-400 rounded-lg pointer-events-none"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PulseSurveyAlert;