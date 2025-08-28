import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * Authentication Store
 * Manages user authentication state and related actions
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      errorData: {},
      needsOnboarding: false,
      needsEmailVerification: false,
      permissions: {},
      nextActions: [],

      // Actions
      setLoading: (loading) => set({ isLoading: loading, error: null, errorData: {} }),
      
      setError: (error) => set({ error, errorData: {}, isLoading: false }),
      
      clearError: () => set({ error: null, errorData: {} }),

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null, errorData: {} });
        
        try {
          const response = await api.login(credentials);
          
          if (response.success) {
            const { user, accessToken, accountStatus, nextActions, permissions } = response.data;
            
            // Store token if provided
            if (accessToken) {
              api.setToken(accessToken);
            }
            
            set({
              user,
              isAuthenticated: true,
              needsOnboarding: accountStatus?.needsOnboarding || false,
              needsEmailVerification: accountStatus?.needsEmailVerification || false,
              permissions: permissions || {},
              nextActions: nextActions || [],
              isLoading: false,
              error: null,
            });

            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          let errorMessage = 'Login failed';
          let errorData = {};
          
          // Handle different error types
          if (error.response?.data) {
            const responseData = error.response.data;
            errorMessage = responseData.message || 'Login failed';
            
            // Handle email verification requirement
            if (responseData.requiresEmailVerification) {
              errorData = {
                requiresEmailVerification: true,
                email: responseData.email
              };
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            errorData,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          return { success: false, error: errorMessage, errorData };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.register(userData);
          
          if (response.success) {
            // After registration, user might need email verification
            set({
              user: response.data.user,
              isAuthenticated: false, // Don't auto-login after registration
              needsEmailVerification: response.data.needsEmailVerification || true,
              isLoading: false,
              error: null,
            });

            return { success: true, data: response.data };
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          let errorMessage = 'Registration failed';
          
          // Handle different error types
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error.message);
        } finally {
          // Always clear local state, even if API call fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            errorData: {},
            needsOnboarding: false,
            needsEmailVerification: false,
            permissions: {},
            nextActions: [],
          });
        }
      },

      // Refresh user profile
      refreshProfile: async () => {
        try {
          const response = await api.getProfile();
          
          if (response.success) {
            set({
              user: response.data.user,
              needsOnboarding: !response.data.user.onboarding?.completed,
            });
            return response.data.user;
          }
        } catch (error) {
          console.warn('Failed to refresh profile:', error.message);
          // Don't throw error, just log it
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await api.updateProfile(profileData);
          
          if (response.success) {
            set({
              user: response.data.user,
            });
            return response.data.user;
          }
        } catch (error) {
          console.error('Failed to update profile:', error.message);
          throw error;
        }
      },

      // Update user after onboarding completion
      completeOnboarding: () => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              onboarding: { completed: true },
            },
            needsOnboarding: false,
          });
        }
      },

      // Update user's wellness stats (happy coins, streaks, etc.)
      updateWellnessStats: (wellnessUpdate) => {
        const currentUser = get().user;
        console.log('🔍 AUTH STORE - Updating wellness stats:', wellnessUpdate);
        console.log('🔍 AUTH STORE - Current user wellness:', currentUser?.wellness);
        
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            wellness: {
              ...currentUser.wellness,
              ...wellnessUpdate,
            },
          };
          
          console.log('🔍 AUTH STORE - Updated user wellness:', updatedUser.wellness);
          set({ user: updatedUser });
        }
      },

      // Initialize authentication state (call on app startup)
      initializeAuth: async () => {
        const token = api.getToken();
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await api.getProfile();
          
          if (response.success) {
            const user = response.data.user;
            set({
              user,
              isAuthenticated: true,
              needsOnboarding: !user.onboarding?.completed,
              needsEmailVerification: !user.isEmailVerified,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Failed to get user profile');
          }
        } catch (error) {
          console.warn('Auth initialization failed:', error.message);
          // Token might be expired or invalid
          api.removeToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Check if user has specific role
      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        
        return user.role === role;
      },

      // Check if user can access HR features
      canAccessHRFeatures: () => {
        return get().hasRole(['hr', 'admin']);
      },

      // Check if user can access admin features
      canAccessAdminFeatures: () => {
        return get().hasRole('admin');
      },

      // Check if user can access manager features
      canAccessManagerFeatures: () => {
        return get().hasRole(['manager', 'hr', 'admin']);
      },

      // Update user data
      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData },
          needsOnboarding: userData.onboardingCompleted ? false : state.needsOnboarding
        }));
      },
    }),
    {
      name: 'wellness-auth-storage',
      // Only persist essential user data, not sensitive tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding,
        needsEmailVerification: state.needsEmailVerification,
      }),
    }
  )
);

export default useAuthStore;