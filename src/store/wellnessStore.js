import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * Wellness Store
 * Manages wellness-related data including check-ins, surveys, challenges, and rewards
 */
const useWellnessStore = create(
  persist(
    (set, get) => ({
      // State
      todayCheckIn: null,
      checkInHistory: [],
      checkInTrend: null,
      activeSurveys: [],
      activeChallenges: [],
      rewards: [],
      achievements: [],
      personalInsights: null,
      isLoading: false,
      error: null,

      // Loading states for different sections
      loadingStates: {
        checkIn: false,
        surveys: false,
        challenges: false,
        rewards: false,
        achievements: false,
        insights: false,
      },

      // Actions
      setLoading: (section, loading) => set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [section]: loading,
        },
      })),

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // =================
      // CHECK-IN ACTIONS
      // =================

      // Get today's check-in status
      getTodayCheckIn: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, checkIn: true },
          error: null 
        }));

        try {
          const response = await api.getTodayCheckIn();
          
          if (response.success) {
            const todayCheckIn = response.data.checkedInToday ? response.data.checkIn : null;
            set((state) => ({
              todayCheckIn,
              loadingStates: { ...state.loadingStates, checkIn: false },
            }));
            return response; // Return full response for component to use
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, checkIn: false },
          }));
          throw error;
        }
      },

      // Submit daily check-in
      submitCheckIn: async (checkInData) => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, checkIn: true },
          error: null 
        }));

        try {
          const response = await api.createCheckIn(checkInData);
          
          console.log('🔍 WELLNESS STORE - Check-in response:', response);
          
          if (response.success) {
            const newCheckIn = response.data.checkIn;
            
            // Update today's check-in
            set((state) => ({
              todayCheckIn: newCheckIn,
              loadingStates: { ...state.loadingStates, checkIn: false },
            }));

            // Add to history if it exists
            const currentHistory = get().checkInHistory;
            if (currentHistory.length > 0) {
              set((state) => ({
                checkInHistory: [newCheckIn, ...state.checkInHistory],
              }));
            }

            return {
              success: true,
              checkIn: newCheckIn,
              happyCoinsEarned: response.data.happyCoinsEarned || response.data.checkIn.happyCoinsEarned,
              user: response.data.user, // Include full user data for updates
            };
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, checkIn: false },
          }));
          throw error;
        }
      },

      // Get check-in history
      getCheckInHistory: async (params = {}) => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, checkIn: true },
          error: null 
        }));

        try {
          const response = await api.getCheckInHistory(params);
          
          if (response.success) {
            set((state) => ({
              checkInHistory: response.data.checkIns,
              loadingStates: { ...state.loadingStates, checkIn: false },
            }));
            return response.data;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, checkIn: false },
          }));
          throw error;
        }
      },

      // Get mood trend analysis
      getCheckInTrend: async (period = 30) => {
        try {
          const response = await api.getCheckInTrend(period);
          
          if (response.success) {
            set({ checkInTrend: response.data.trendAnalysis });
            return response.data.trendAnalysis;
          }
        } catch (error) {
          console.warn('Failed to get check-in trend:', error.message);
          throw error;
        }
      },

      // ================
      // SURVEY ACTIONS
      // ================

      // Get active surveys
      getActiveSurveys: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, surveys: true },
          error: null 
        }));

        try {
          const response = await api.getActiveSurveys();
          
          if (response.success) {
            set((state) => ({
              activeSurveys: response.data.surveys,
              loadingStates: { ...state.loadingStates, surveys: false },
            }));
            return response.data.surveys;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, surveys: false },
          }));
          throw error;
        }
      },

      // Submit survey response
      submitSurveyResponse: async (surveyId, responses) => {
        try {
          const response = await api.submitSurveyResponse(surveyId, responses);
          
          if (response.success) {
            // Mark survey as completed in the local state
            set((state) => ({
              activeSurveys: state.activeSurveys.map(survey =>
                survey._id === surveyId
                  ? { ...survey, hasResponded: true }
                  : survey
              ),
            }));

            return {
              success: true,
              rewardEarned: response.data.rewardEarned,
              insights: response.data.personalInsights,
            };
          }
        } catch (error) {
          throw error;
        }
      },

      // Get all surveys (including inactive ones)
      getSurveys: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, surveys: true },
          error: null 
        }));

        try {
          const response = await api.getSurveys();
          
          if (response.success) {
            set((state) => ({
              activeSurveys: response.data.surveys,
              loadingStates: { ...state.loadingStates, surveys: false },
            }));
            return response.data.surveys;
          }
        } catch (error) {
          console.warn('Failed to get surveys:', error.message);
          set((state) => ({
            loadingStates: { ...state.loadingStates, surveys: false },
          }));
          throw error;
        }
      },

      // Note: Backend doesn't provide user survey responses endpoint yet
      // getUserSurveyResponses: async () => {
      //   try {
      //     const response = await api.getUserSurveyResponses();
      //     
      //     if (response.success) {
      //       return response.data.responses;
      //     }
      //   } catch (error) {
      //     console.warn('Failed to get user survey responses:', error.message);
      //     throw error;
      //   }
      // },

      // ===================
      // CHALLENGE ACTIONS
      // ===================

      // Get active challenges
      getActiveChallenges: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, challenges: true },
          error: null 
        }));

        try {
          const response = await api.getActiveChallenges();
          
          if (response.success) {
            set((state) => ({
              activeChallenges: response.data.challenges,
              loadingStates: { ...state.loadingStates, challenges: false },
            }));
            return response.data.challenges;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, challenges: false },
          }));
          throw error;
        }
      },

      // Join a challenge
      joinChallenge: async (challengeId) => {
        try {
          const response = await api.joinChallenge(challengeId);
          
          if (response.success) {
            // Update local state to show user is participating
            set((state) => ({
              activeChallenges: state.activeChallenges.map(challenge =>
                challenge._id === challengeId
                  ? { ...challenge, isParticipating: true, currentProgress: response.data.startingProgress }
                  : challenge
              ),
            }));

            return response;
          }
        } catch (error) {
          throw error;
        }
      },

      // Update challenge progress
      updateChallengeProgress: async (challengeId, progress) => {
        try {
          const response = await api.updateChallengeProgress(challengeId, progress);
          
          if (response.success) {
            // Update local state with new progress
            set((state) => ({
              activeChallenges: state.activeChallenges.map(challenge =>
                challenge._id === challengeId
                  ? { ...challenge, currentProgress: response.data.newProgress }
                  : challenge
              ),
            }));

            return {
              success: true,
              newProgress: response.data.newProgress,
              milestoneAchieved: response.data.milestoneAchieved,
            };
          }
        } catch (error) {
          throw error;
        }
      },

      // ================
      // REWARDS ACTIONS
      // ================

      // Get rewards catalog
      getRewards: async (params = {}) => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, rewards: true },
          error: null 
        }));

        try {
          const response = await api.getRewards(params);
          
          if (response.success) {
            set((state) => ({
              rewards: response.data.rewards,
              loadingStates: { ...state.loadingStates, rewards: false },
            }));
            
            // Update user's happy coins if provided
            if (response.data.userHappyCoins !== undefined) {
              // We need access to auth store here, but for now just return the data
            }
            
            return response.data;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, rewards: false },
          }));
          throw error;
        }
      },

      // Redeem a reward
      redeemReward: async (rewardId, quantity = 1, fulfillmentMethod = 'email', deliveryAddress = null) => {
        try {
          const response = await api.redeemReward(rewardId, quantity, fulfillmentMethod, deliveryAddress);
          
          if (response.success) {
            return {
              success: true,
              redemption: response.data.redemption,
              newHappyCoinBalance: response.data.newHappyCoinBalance,
            };
          }
        } catch (error) {
          throw error;
        }
      },

      // Get user achievements
      getUserAchievements: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, achievements: true },
          error: null 
        }));

        try {
          const response = await api.getUserAchievements();
          
          if (response.success) {
            set((state) => ({
              achievements: response.data.achievements || [],
              loadingStates: { ...state.loadingStates, achievements: false },
            }));
            return response.data;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, achievements: false },
          }));
          console.warn('Failed to get achievements:', error.message);
          throw error;
        }
      },

      // Send peer recognition
      sendPeerRecognition: async (recognition) => {
        try {
          const response = await api.sendPeerRecognition(recognition);
          return response;
        } catch (error) {
          throw error;
        }
      },

      // ===============
      // AI INSIGHTS
      // ===============

      // Get personalized insights
      getPersonalInsights: async () => {
        set((state) => ({ 
          ...state,
          loadingStates: { ...state.loadingStates, insights: true },
          error: null 
        }));

        try {
          const response = await api.getPersonalizedInsights();
          
          if (response.success) {
            set((state) => ({
              personalInsights: response.data.insights,
              loadingStates: { ...state.loadingStates, insights: false },
            }));
            return response.data.insights;
          }
        } catch (error) {
          set((state) => ({
            error: error.message,
            loadingStates: { ...state.loadingStates, insights: false },
          }));
          throw error;
        }
      },

      // Get weekly AI summary
      getWeeklyAISummary: async () => {
        try {
          const response = await api.getWeeklyAISummary();
          
          if (response.success) {
            return response.data.weeklySummary;
          }
        } catch (error) {
          console.warn('Failed to get weekly summary:', error.message);
          throw error;
        }
      },

      // ================
      // UTILITY ACTIONS
      // ================

      // Initialize wellness data (call after login)
      initializeWellnessData: async () => {
        try {
          // Load essential data in parallel
          await Promise.all([
            get().getTodayCheckIn(),
            get().getActiveSurveys(),
            get().getActiveChallenges(),
          ]);
        } catch (error) {
          console.warn('Failed to initialize wellness data:', error.message);
        }
      },

      // Refresh all data
      refreshAllData: async () => {
        set({ isLoading: true });
        
        try {
          await Promise.all([
            get().getTodayCheckIn(),
            get().getActiveSurveys(),
            get().getActiveChallenges(),
            get().getPersonalInsights(),
          ]);
        } catch (error) {
          console.warn('Failed to refresh data:', error.message);
        } finally {
          set({ isLoading: false });
        }
      },

      // Clear all data (call on logout)
      clearAllData: () => {
        set({
          todayCheckIn: null,
          checkInHistory: [],
          checkInTrend: null,
          activeSurveys: [],
          activeChallenges: [],
          rewards: [],
          achievements: [],
          personalInsights: null,
          error: null,
          loadingStates: {
            checkIn: false,
            surveys: false,
            challenges: false,
            rewards: false,
            insights: false,
          },
        });
      },
    }),
    {
      name: 'wellness-data-storage',
      // Only persist non-sensitive data
      partialize: (state) => ({
        todayCheckIn: state.todayCheckIn,
        checkInHistory: state.checkInHistory.slice(0, 10), // Keep only recent 10
        activeSurveys: state.activeSurveys,
        achievements: state.achievements,
      }),
    }
  )
);

export default useWellnessStore;