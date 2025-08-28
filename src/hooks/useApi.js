import { useState, useCallback } from 'react';
import { useToast } from '../components/shared/Toast';
import api from '../services/api';

/**
 * Custom hook for API calls with built-in error handling and loading states
 * Provides consistent error handling and loading states across the application
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const executeRequest = useCallback(async (
    requestFunction, 
    options = {}
  ) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      errorMessage = null,
      loadingState = true
    } = options;

    try {
      if (loadingState) setLoading(true);
      setError(null);

      const result = await requestFunction();

      if (result.success) {
        if (showSuccessToast) {
          toast.success(successMessage, 'Success');
        }
        if (onSuccess) onSuccess(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (err) {
      const errorMsg = errorMessage || err.message || 'An unexpected error occurred';
      setError(errorMsg);
      
      if (showErrorToast) {
        toast.error(errorMsg, 'Error');
      }
      
      if (onError) onError(err);
      throw err;
    } finally {
      if (loadingState) setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    executeRequest,
    clearError: () => setError(null)
  };
}

/**
 * Specific hooks for common API operations
 */

export function useCheckIn() {
  const { executeRequest, loading, error } = useApi();

  const submitCheckIn = useCallback((checkInData) => {
    return executeRequest(
      () => api.createCheckIn(checkInData),
      {
        showSuccessToast: true,
        successMessage: 'Check-in submitted successfully! 🎉',
        errorMessage: 'Failed to submit check-in. Please try again.'
      }
    );
  }, [executeRequest]);

  const getTodayCheckIn = useCallback(() => {
    return executeRequest(
      () => api.getTodayCheckIn(),
      {
        showErrorToast: false // Don't show error if no check-in today
      }
    );
  }, [executeRequest]);

  return {
    submitCheckIn,
    getTodayCheckIn,
    loading,
    error
  };
}

export function useAnalytics() {
  const { executeRequest, loading, error } = useApi();

  const getCompanyOverview = useCallback((params = {}) => {
    return executeRequest(
      () => api.getCompanyOverview(params),
      {
        errorMessage: 'Failed to load company analytics'
      }
    );
  }, [executeRequest]);

  const getRiskAssessment = useCallback((params = {}) => {
    return executeRequest(
      () => api.getRiskAssessment(params),
      {
        errorMessage: 'Failed to load risk assessment data'
      }
    );
  }, [executeRequest]);

  const getEngagementMetrics = useCallback((params = {}) => {
    return executeRequest(
      () => api.getEngagementMetrics(params),
      {
        errorMessage: 'Failed to load engagement metrics'
      }
    );
  }, [executeRequest]);

  const exportAnalytics = useCallback((params = {}) => {
    return executeRequest(
      () => api.exportAnalytics(params),
      {
        showSuccessToast: true,
        successMessage: 'Analytics exported successfully',
        errorMessage: 'Failed to export analytics data'
      }
    );
  }, [executeRequest]);

  return {
    getCompanyOverview,
    getRiskAssessment,
    getEngagementMetrics,
    exportAnalytics,
    loading,
    error
  };
}

export function useRewards() {
  const { executeRequest, loading, error } = useApi();

  const getRewards = useCallback((params = {}) => {
    return executeRequest(
      () => api.getRewards(params),
      {
        errorMessage: 'Failed to load rewards'
      }
    );
  }, [executeRequest]);

  const redeemReward = useCallback((rewardId, quantity = 1, deliveryAddress = null) => {
    return executeRequest(
      () => api.redeemReward(rewardId, quantity, deliveryAddress),
      {
        showSuccessToast: true,
        successMessage: 'Reward redeemed successfully! 🎁',
        errorMessage: 'Failed to redeem reward. Please try again.'
      }
    );
  }, [executeRequest]);

  const getUserAchievements = useCallback(() => {
    return executeRequest(
      () => api.getUserAchievements(),
      {
        errorMessage: 'Failed to load achievements'
      }
    );
  }, [executeRequest]);

  return {
    getRewards,
    redeemReward,
    getUserAchievements,
    loading,
    error
  };
}

export function useSurveys() {
  const { executeRequest, loading, error } = useApi();

  const getActiveSurveys = useCallback(() => {
    return executeRequest(
      () => api.getActiveSurveys(),
      {
        errorMessage: 'Failed to load active surveys'
      }
    );
  }, [executeRequest]);

  const submitSurveyResponse = useCallback((surveyId, responses) => {
    return executeRequest(
      () => api.submitSurveyResponse(surveyId, responses),
      {
        showSuccessToast: true,
        successMessage: 'Survey response submitted successfully! 📝',
        errorMessage: 'Failed to submit survey response. Please try again.'
      }
    );
  }, [executeRequest]);

  return {
    getActiveSurveys,
    submitSurveyResponse,
    loading,
    error
  };
}

export function useProfile() {
  const { executeRequest, loading, error } = useApi();

  const getProfile = useCallback(() => {
    return executeRequest(
      () => api.getProfile(),
      {
        errorMessage: 'Failed to load profile data'
      }
    );
  }, [executeRequest]);

  const updateProfile = useCallback((profileData) => {
    return executeRequest(
      () => api.request('/profile', { method: 'PUT', data: profileData }),
      {
        showSuccessToast: true,
        successMessage: 'Profile updated successfully',
        errorMessage: 'Failed to update profile. Please try again.'
      }
    );
  }, [executeRequest]);

  return {
    getProfile,
    updateProfile,
    loading,
    error
  };
}

/**
 * Retry mechanism for failed requests
 */
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const retry = useCallback(async (requestFunction, delay = 1000) => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }

    try {
      setRetryCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, delay * retryCount));
      const result = await requestFunction();
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      if (retryCount < maxRetries - 1) {
        return retry(requestFunction, delay);
      } else {
        setRetryCount(0);
        throw error;
      }
    }
  }, [retryCount, maxRetries]);

  return { retry, retryCount, canRetry: retryCount < maxRetries };
}