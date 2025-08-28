import { useState, useEffect, useCallback } from 'react';
import { useSurveys } from './useApi';
import useAuthStore from '../store/authStore';

export const useSurveyNotifications = () => {
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const [overdueSurveys, setOverdueSurveys] = useState([]);
  const [urgentSurveys, setUrgentSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationLevel, setNotificationLevel] = useState('none'); // none, low, medium, high, urgent

  const { getActiveSurveys } = useSurveys();
  const { user } = useAuthStore();

  // Calculate days overdue
  const getDaysOverdue = useCallback((survey) => {
    if (!survey.dueDate) return 0;
    
    const now = new Date();
    const dueDate = new Date(survey.dueDate);
    const diffTime = now - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, []);

  // Calculate notification urgency level
  const getUrgencyLevel = useCallback((survey) => {
    const daysOverdue = getDaysOverdue(survey);
    const priority = survey.priority || 'normal';
    
    if (priority === 'urgent' || daysOverdue >= 7) return 'urgent';
    if (priority === 'high' || daysOverdue >= 3) return 'high';
    if (daysOverdue >= 1) return 'medium';
    return 'low';
  }, [getDaysOverdue]);

  // Check if survey is overdue
  const isOverdue = useCallback((survey) => {
    if (!survey.dueDate) return false;
    return new Date() > new Date(survey.dueDate);
  }, []);

  // Get survey urgency color
  const getUrgencyColor = useCallback((survey) => {
    const urgency = getUrgencyLevel(survey);
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[urgency] || colors.low;
  }, [getUrgencyLevel]);

  // Get notification badge color for UI indicators
  const getNotificationBadgeColor = useCallback((level) => {
    const colors = {
      none: '',
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500 animate-pulse'
    };
    return colors[level] || '';
  }, []);

  // Load and categorize surveys
  const loadSurveyNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const surveysData = await getActiveSurveys();
      
      // Extract surveys from response
      let surveysList = [];
      if (Array.isArray(surveysData)) {
        surveysList = surveysData;
      } else if (surveysData?.data?.surveys) {
        surveysList = surveysData.data.surveys;
      } else if (surveysData?.surveys) {
        surveysList = surveysData.surveys;
      }

      // Filter for pulse surveys only
      const pulseSurveys = surveysList.filter(survey => 
        survey.type === 'pulse' && 
        survey.status === 'active' &&
        !survey.responses?.some(r => r.userId === user.id)
      );

      setPendingSurveys(pulseSurveys);

      // Categorize surveys
      const overdue = pulseSurveys.filter(isOverdue);
      const urgent = pulseSurveys.filter(s => getUrgencyLevel(s) === 'urgent');

      setOverdueSurveys(overdue);
      setUrgentSurveys(urgent);

      // Determine overall notification level
      if (urgent.length > 0) {
        setNotificationLevel('urgent');
      } else if (overdue.length > 0) {
        setNotificationLevel('high');
      } else if (pulseSurveys.length > 0) {
        setNotificationLevel('medium');
      } else {
        setNotificationLevel('none');
      }

    } catch (error) {
      console.error('Failed to load survey notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getActiveSurveys, isOverdue, getUrgencyLevel]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadSurveyNotifications();
    const interval = setInterval(loadSurveyNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadSurveyNotifications]);

  return {
    pendingSurveys,
    overdueSurveys,
    urgentSurveys,
    loading,
    notificationLevel,
    getDaysOverdue,
    getUrgencyLevel,
    getUrgencyColor,
    getNotificationBadgeColor,
    isOverdue,
    refresh: loadSurveyNotifications
  };
};

export default useSurveyNotifications;