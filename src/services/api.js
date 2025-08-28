import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * WelldifyAI API Service
 * Handles all communication with the backend API
 * Base URL: https://wellness-backend-production-48b1.up.railway.app/api
 */
class WellnessAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://wellness-backend-production-48b1.up.railway.app/api';
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          
          // Debug: Log token info for management endpoints
          if (config.url && (config.url.includes('/challenges') || config.url.includes('/surveys') || config.url.includes('/rewards') || config.url.includes('/resources'))) {
            console.log('🔍 API REQUEST DEBUG - URL:', config.url);
            console.log('🔍 API REQUEST DEBUG - Method:', config.method);
            console.log('🔍 API REQUEST DEBUG - Token exists:', !!token);
            console.log('🔍 API REQUEST DEBUG - Token preview:', token ? token.substring(0, 50) + '...' : 'null');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        // Debug: Log response for management endpoints
        if (response.config.url && (response.config.url.includes('/challenges') || response.config.url.includes('/surveys') || response.config.url.includes('/rewards') || response.config.url.includes('/resources'))) {
          console.log('✅ API RESPONSE DEBUG - URL:', response.config.url);
          console.log('✅ API RESPONSE DEBUG - Status:', response.status);
          console.log('✅ API RESPONSE DEBUG - Data:', response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const token = this.getToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Debug: Log errors for management endpoints
        if (error.config?.url && (error.config.url.includes('/challenges') || error.config.url.includes('/surveys') || error.config.url.includes('/rewards') || error.config.url.includes('/resources'))) {
          console.error('❌ API ERROR DEBUG - URL:', error.config.url);
          console.error('❌ API ERROR DEBUG - Status:', error.response?.status);
          console.error('❌ API ERROR DEBUG - Data:', error.response?.data);
          console.error('❌ API ERROR DEBUG - Message:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken() {
    return localStorage.getItem('accessToken') || Cookies.get('accessToken');
  }

  setToken(token) {
    localStorage.setItem('accessToken', token);
    Cookies.set('accessToken', token, { expires: 7 });
  }

  removeToken() {
    localStorage.removeItem('accessToken');
    Cookies.remove('accessToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const response = await this.api({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      // Handle different types of errors
      if (error.response?.data) {
        const { data } = error.response;
        
        // If validation errors exist, format them nicely
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors = data.errors.map(err => err.msg).join(', ');
          throw new Error(validationErrors);
        }
        
        // Use the server's error message
        const errorMessage = data.message || 'API request failed';
        throw new Error(errorMessage);
      }
      
      // Network or other errors
      const errorMessage = error.message || 'API request failed';
      throw new Error(errorMessage);
    }
  }

  // ===================
  // AUTHENTICATION APIs
  // ===================

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      data: userData,
    });
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      data: credentials,
    });
    
    // 🔍 DEBUG: Login response debugging
    console.log('🔍 LOGIN DEBUG - Full Response:', response);
    console.log('🔍 LOGIN DEBUG - Success:', response.success);
    console.log('🔍 LOGIN DEBUG - User Data:', response.data);
    
    if (response.data) {
      console.log('🔍 LOGIN DEBUG - Account Status:', response.data.accountStatus);
      console.log('🔍 LOGIN DEBUG - Needs Onboarding:', response.data.accountStatus?.needsOnboarding);
      console.log('🔍 LOGIN DEBUG - Next Actions:', response.data.nextActions);
      console.log('🔍 LOGIN DEBUG - Permissions:', response.data.permissions);
    }
    
    if (response.success && response.data.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error.message);
    } finally {
      this.removeToken();
    }
  }

  async refreshToken() {
    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.success && response.data.accessToken) {
        this.setToken(response.data.accessToken);
        return response;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      // Clear token on refresh failure
      this.removeToken();
      throw error;
    }
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/profile', {
      method: 'PUT',
      data: profileData,
    });
  }

  async updatePreferences(preferencesData) {
    return await this.request('/profile/preferences', {
      method: 'PUT',
      data: preferencesData,
    });
  }

  async uploadAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    return await this.request('/profile/avatar', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getWellnessStats() {
    return await this.request('/profile/wellness-stats');
  }

  async forgotPassword(data) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      data,
    });
  }

  async resetPassword(data) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      data,
    });
  }

  async verifyEmail(token) {
    return await this.request('/auth/verify-email', {
      method: 'POST',
      data: { token },
    });
  }

  async resendVerification(email) {
    return await this.request('/auth/resend-verification', {
      method: 'POST',
      data: { email },
    });
  }

  // =================
  // DAILY CHECK-INS
  // =================

  async createCheckIn(checkInData) {
    const response = await this.request('/checkins', {
      method: 'POST',
      data: checkInData,
    });
    
    // Debug check-in response
    console.log('🔍 CHECK-IN API - Response:', response);
    console.log('🔍 CHECK-IN API - Happy coins earned:', response.data?.happyCoinsEarned);
    console.log('🔍 CHECK-IN API - User data:', response.data?.user);
    
    return response;
  }

  async getTodayCheckIn() {
    return await this.request('/checkins/today');
  }

  async getCheckInHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/checkins?${queryString}`);
  }

  async getCheckInTrend(period = 30) {
    return await this.request(`/checkins/trend?period=${period}`);
  }

  // ===================
  // ONBOARDING SYSTEM
  // ===================

  async getOnboardingQuestionnaire() {
    const response = await this.request('/onboarding/questionnaire');
    
    // 🔍 DEBUG: Onboarding questionnaire debugging
    console.log('🔍 ONBOARDING DEBUG - Full Response:', response);
    console.log('🔍 ONBOARDING DEBUG - Success:', response.success);
    console.log('🔍 ONBOARDING DEBUG - Questionnaire Data:', response.data);
    
    if (response.data?.questionnaire) {
      console.log('🔍 ONBOARDING DEBUG - Sections Count:', response.data.questionnaire.sections?.length);
      console.log('🔍 ONBOARDING DEBUG - Sections:', response.data.questionnaire.sections);
      console.log('🔍 ONBOARDING DEBUG - Progress:', response.data.progress);
    }
    
    return response;
  }

  async submitOnboardingResponses(responses) {
    return await this.request('/onboarding/submit', {
      method: 'POST',
      data: responses,
    });
  }

  async getOnboardingStatus() {
    return await this.request('/onboarding/status');
  }

  // ===============
  // PULSE SURVEYS
  // ===============

  async getActiveSurveys() {
    return await this.request('/surveys/active');
  }

  async submitSurveyResponse(surveyId, responses) {
    return await this.request(`/surveys/${surveyId}/respond`, {
      method: 'POST',
      data: { responses },
    });
  }

  async getSurveys() {
    return await this.request('/surveys');
  }

  async getUserSurveyResponses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/surveys/responses?${queryString}`);
  }

  async getSurveyHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/surveys/history?${queryString}`);
  }

  // Survey Management (HR/Admin)
  async createSurvey(surveyData) {
    return await this.request('/surveys', {
      method: 'POST',
      data: surveyData,
    });
  }

  async updateSurvey(surveyId, surveyData) {
    return await this.request(`/surveys/${surveyId}`, {
      method: 'PUT',
      data: surveyData,
    });
  }

  async deleteSurvey(surveyId) {
    return await this.request(`/surveys/${surveyId}`, {
      method: 'DELETE',
    });
  }

  async distributeSurvey(surveyId, distributionData) {
    return await this.request(`/surveys/${surveyId}/distribute`, {
      method: 'POST',
      data: distributionData,
    });
  }

  async updateSurveyStatus(surveyId, status) {
    return await this.request(`/surveys/${surveyId}/status`, {
      method: 'PATCH',
      data: { status },
    });
  }

  // Note: Backend doesn't provide user survey responses endpoint yet
  // async getUserSurveyResponses() {
  //   return await this.request('/surveys/responses');
  // }

  // ====================
  // WELLNESS CHALLENGES
  // ====================

  async getChallenges(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/challenges?${queryString}`);
  }

  async getActiveChallenges() {
    return await this.request('/challenges/active');
  }

  async getUserChallenges() {
    return await this.request('/challenges/my-challenges');
  }

  async joinChallenge(challengeId) {
    return await this.request(`/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  async updateChallengeProgress(challengeId, progress) {
    return await this.request(`/challenges/${challengeId}/progress`, {
      method: 'POST',
      data: { progress },
    });
  }

  // Challenge Management (HR/Admin)
  async createChallenge(challengeData) {
    return await this.request('/challenges', {
      method: 'POST',
      data: challengeData,
    });
  }

  async updateChallenge(challengeId, challengeData) {
    return await this.request(`/challenges/${challengeId}`, {
      method: 'PUT',
      data: challengeData,
    });
  }

  async deleteChallenge(challengeId) {
    return await this.request(`/challenges/${challengeId}`, {
      method: 'DELETE',
    });
  }

  async updateChallengeStatus(challengeId, status) {
    return await this.request(`/challenges/${challengeId}/status`, {
      method: 'PATCH',
      data: { status },
    });
  }

  // ==================
  // RESOURCE LIBRARY
  // ==================

  async getResources(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/resources?${queryString}`);
  }

  async getResourceCategories() {
    return await this.request('/resources/categories');
  }

  async getResourcesByCategory(category) {
    return await this.request(`/resources/category/${category}`);
  }

  async trackResourceInteraction(resourceId, action, data = {}) {
    return await this.request(`/resources/${resourceId}/interact`, {
      method: 'POST',
      data: { action, data },
    });
  }

  async getResourceHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/resources/history?${queryString}`);
  }

  async getMyResourceActivity(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/resources/my-activity?${queryString}`);
  }

  async getResourceInteractions(resourceId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/resources/${resourceId}/interactions?${queryString}`);
  }

  async getUserFavorites() {
    return await this.request('/resources/favorites');
  }

  async addToFavorites(resourceId) {
    return await this.request(`/resources/${resourceId}/favorite`, {
      method: 'POST',
    });
  }

  async removeFromFavorites(resourceId) {
    return await this.request(`/resources/${resourceId}/favorite`, {
      method: 'DELETE',
    });
  }

  // Resource Management (HR/Admin)
  async createResource(resourceData) {
    return await this.request('/resources', {
      method: 'POST',
      data: resourceData,
    });
  }

  async updateResource(resourceId, resourceData) {
    return await this.request(`/resources/${resourceId}`, {
      method: 'PUT',
      data: resourceData,
    });
  }

  async deleteResource(resourceId) {
    return await this.request(`/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  // ================
  // REWARDS SYSTEM
  // ================

  async getRewards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/rewards?${queryString}`);
  }

  async redeemReward(rewardId, quantity = 1, fulfillmentMethod = 'email', deliveryAddress = null) {
    const data = { 
      quantity,
      fulfillmentMethod
    };
    
    if (deliveryAddress) {
      data.address = deliveryAddress;
    }
    
    return await this.request(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
      data,
    });
  }

  async getUserAchievements() {
    return await this.request('/rewards/achievements/my-achievements');
  }

  async getRewardHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/rewards/history?${queryString}`);
  }

  async getMyRedemptions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/rewards/my-redemptions?${queryString}`);
  }

  async sendPeerRecognition(recognition) {
    return await this.request('/rewards/recognitions/send', {
      method: 'POST',
      data: recognition,
    });
  }

  // Reward Management (Admin only)
  async createReward(rewardData) {
    return await this.request('/rewards', {
      method: 'POST',
      data: rewardData,
    });
  }

  async updateReward(rewardId, rewardData) {
    return await this.request(`/rewards/${rewardId}`, {
      method: 'PUT',
      data: rewardData,
    });
  }

  async deleteReward(rewardId) {
    return await this.request(`/rewards/${rewardId}`, {
      method: 'DELETE',
    });
  }

  // ============
  // AI SERVICES
  // ============

  async getPersonalizedInsights() {
    return await this.request('/ai/insights');
  }

  async getWeeklyAISummary() {
    return await this.request('/ai/summary/weekly');
  }

  // ========================
  // TEAM MANAGEMENT (Manager)
  // ========================

  async getTeamOverview() {
    return await this.request('/team/overview');
  }

  async getTeamMoodTrend() {
    return await this.request('/team/mood-trend');
  }

  async getTeamRiskAssessment() {
    return await this.request('/team/risk-assessment');
  }

  async getTeamSurveyParticipation() {
    return await this.request('/team/survey-participation');
  }

  // ========================
  // HR ANALYTICS (HR/Admin)
  // ========================

  async getCompanyOverview(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/company-overview?${queryString}`);
  }

  async getDepartmentAnalytics(department, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/department/${department}?${queryString}`);
  }

  async getRiskAssessment(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/risk-assessment?${queryString}`);
  }

  async getEngagementMetrics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/engagement?${queryString}`);
  }

  async exportAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/export?${queryString}`);
  }

  async getTeamEngagementMetrics() {
    return await this.request('/team/engagement');
  }

  // ======================
  // USER MANAGEMENT (Admin)
  // ======================

  async getAllUsers(params = {}) {
    // Filter out empty string values to avoid validation errors
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/users?${queryString}`);
  }

  async getUserById(userId) {
    return await this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      data: userData,
    });
  }

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      data: userData,
    });
  }

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(userId, isActive) {
    return await this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      data: { isActive },
    });
  }

  async updateUserRole(userId, role) {
    return await this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      data: { role },
    });
  }

  async bulkUserAction(action, userIds) {
    return await this.request('/users/bulk-action', {
      method: 'POST',
      data: { action, userIds },
    });
  }

  async getDepartments() {
    return await this.request('/users/departments');
  }

  // =====================
  // NOTIFICATION SYSTEM
  // =====================

  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/notifications?${queryString}`);
  }

  async getUnreadNotificationCount() {
    return await this.request('/notifications/unread-count');
  }

  async getNotificationStats() {
    return await this.request('/notifications/stats');
  }

  async markNotificationsAsRead(notificationIds) {
    return await this.request('/notifications/mark-read', {
      method: 'PATCH',
      data: { notificationIds },
    });
  }

  async markAllNotificationsAsRead() {
    return await this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // ================
  // JOURNAL SYSTEM
  // ================

  async getJournalEntries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/journals?${queryString}`);
  }

  async createJournalEntry(entryData) {
    return await this.request('/journals', {
      method: 'POST',
      data: entryData,
    });
  }

  async getJournalEntry(entryId) {
    return await this.request(`/journals/${entryId}`);
  }

  async updateJournalEntry(entryId, entryData) {
    return await this.request(`/journals/${entryId}`, {
      method: 'PUT',
      data: entryData,
    });
  }

  async deleteJournalEntry(entryId) {
    return await this.request(`/journals/${entryId}`, {
      method: 'DELETE',
    });
  }

  async getJournalStats() {
    return await this.request('/journals/stats');
  }

  async getJournalPrompts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/journals/prompts?${queryString}`);
  }

  async getJournalInsights() {
    return await this.request('/journals/insights');
  }

  async getJournalStreak() {
    return await this.request('/journals/streak');
  }

  async searchJournalEntries(query) {
    return await this.request(`/journals/search?q=${encodeURIComponent(query)}`);
  }

  // ==============
  // QUOTES SYSTEM
  // ==============

  async getTodayQuote() {
    return await this.request('/quotes/today');
  }

  async getQuoteHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/quotes/history?${queryString}`);
  }

  async markQuoteAsViewed(quoteId, viewingTime = null) {
    return await this.request(`/quotes/${quoteId}/view`, {
      method: 'POST',
      data: viewingTime ? { viewingTime } : {},
    });
  }

  async toggleQuoteLike(quoteId) {
    return await this.request(`/quotes/${quoteId}/like`, {
      method: 'POST',
    });
  }

  async shareQuote(quoteId) {
    return await this.request(`/quotes/${quoteId}/share`, {
      method: 'POST',
    });
  }

  async submitQuoteFeedback(quoteId, feedback) {
    return await this.request(`/quotes/${quoteId}/feedback`, {
      method: 'POST',
      data: feedback,
    });
  }

  async getQuoteStats() {
    return await this.request('/quotes/stats');
  }

  async getQuoteCategories() {
    return await this.request('/quotes/categories');
  }

  async searchQuotes(query) {
    return await this.request(`/quotes/search?q=${encodeURIComponent(query)}`);
  }

  // ===================
  // LEADERBOARD SYSTEM
  // ===================

  async getHappyCoinsLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/leaderboard/happy-coins?${queryString}`);
  }

  async getDepartmentLeaderboard(department, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/leaderboard/department/${department}?${queryString}`);
  }

  async getLeaderboardStats() {
    return await this.request('/leaderboard/stats');
  }

  async getUserRanking(userId = null) {
    const endpoint = userId ? `/leaderboard/user/${userId}` : '/leaderboard/user';
    return await this.request(endpoint);
  }

  // ===================
  // SLACK INTEGRATION
  // ===================

  async getSlackStatus() {
    return await this.request('/integrations/slack/status');
  }

  async connectSlack() {
    return await this.request('/integrations/slack/connect', {
      method: 'POST',
    });
  }

  async disconnectSlack() {
    return await this.request('/integrations/slack/disconnect', {
      method: 'POST',
    });
  }

  async getIntegrationStats() {
    return await this.request('/integrations/stats');
  }

  // ==================
  // UTILITY METHODS
  // ==================

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`);
      return response.data;
    } catch {
      throw new Error('Backend service is not available');
    }
  }

  // Error handling helper
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: data.message || 'Invalid input provided',
            errors: data.errors || [],
          };
        case 401:
          return {
            type: 'authentication',
            message: 'Please log in to continue',
          };
        case 403:
          return {
            type: 'authorization',
            message: 'You do not have permission to perform this action',
          };
        case 404:
          return {
            type: 'not_found',
            message: 'The requested resource was not found',
          };
        case 429:
          return {
            type: 'rate_limit',
            message: 'Too many requests. Please try again later.',
            retryAfter: data.retryAfter,
          };
        case 500:
          return {
            type: 'server_error',
            message: 'Internal server error. Please try again later.',
          };
        default:
          return {
            type: 'unknown',
            message: data.message || 'An unexpected error occurred',
          };
      }
    } else if (error.request) {
      // Request made but no response
      return {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    } else {
      // Other error
      return {
        type: 'client',
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

// Create and export a singleton instance
const api = new WellnessAPI();

export default api;

// Named exports for convenience
export {
  WellnessAPI,
  api as wellnessAPI,
};