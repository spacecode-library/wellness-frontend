import React, { createContext, useContext } from 'react';
import useSurveyNotifications from '../hooks/useSurveyNotifications';

const SurveyNotificationContext = createContext();

export const useSurveyNotificationContext = () => {
  const context = useContext(SurveyNotificationContext);
  if (!context) {
    throw new Error(
      'useSurveyNotificationContext must be used within a SurveyNotificationProvider'
    );
  }
  return context;
};

export const SurveyNotificationProvider = ({ children }) => {
  const surveyNotifications = useSurveyNotifications();

  return (
    <SurveyNotificationContext.Provider value={surveyNotifications}>
      {children}
    </SurveyNotificationContext.Provider>
  );
};

export default SurveyNotificationContext;