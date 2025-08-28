import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Store imports
import useAuthStore from './store/authStore';
import useWellnessStore from './store/wellnessStore';

// Component imports
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Page imports
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CheckIn from './pages/employee/CheckIn';
import Surveys from './pages/employee/Surveys';
import Rewards from './pages/employee/Rewards';
import Challenges from './pages/employee/Challenges';
import Resources from './pages/employee/Resources';
import ResourceView from './pages/employee/ResourceView';
import Journal from './pages/employee/Journal';
import Leaderboard from './pages/employee/Leaderboard';
import Profile from './pages/employee/Profile';

// HR pages
import HRDashboard from './pages/hr/Dashboard';
import HRAnalytics from './pages/hr/Analytics';
import ResourceManagement from './pages/hr/ResourceManagement';
import ChallengeManagement from './pages/hr/ChallengeManagement';
import SurveyManagement from './pages/hr/SurveyManagement';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';
import UserManagement from './pages/admin/UserManagement';
import HRManagement from './pages/admin/HRManagement';
import RewardManagement from './pages/admin/RewardManagement';

// Other pages
import Onboarding from './pages/onboarding/Onboarding';
import NotFound from './pages/error/NotFound';
import ServerError from './pages/error/ServerError';

// Loading and error components
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/shared/Toast';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

/**
 * Protected Route Component with Enhanced Role-Based Access
 */
function ProtectedRoute({ children, requiredRole = null, allowedRoles = null }) {
  const { isAuthenticated, user, hasRole, needsOnboarding, needsEmailVerification } = useAuthStore();

  // Debug logs (remove in production)
  // console.log('🔍 PROTECTED ROUTE - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check email verification for ALL roles
  if (needsEmailVerification) {
    console.log('🔍 PROTECTED ROUTE - Redirecting to email verification...');
    return <Navigate to="/verify-email" replace />;
  }

  // Check onboarding completion for all users
  if (needsOnboarding) {
    console.log('🔍 PROTECTED ROUTE - Redirecting to onboarding...');
    return <Navigate to="/onboarding" replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleBasedDashboard(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectPath = getRoleBasedDashboard(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

/**
 * Get dashboard path based on user role
 */
function getRoleBasedDashboard(role) {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'hr': return '/hr/dashboard';
    case 'employee': return '/employee/dashboard';
    default: return '/employee/dashboard';
  }
}

/**
 * Onboarding Route Component (only checks authentication, not onboarding status)
 */
function OnboardingRoute({ children }) {
  const { isAuthenticated, user, needsEmailVerification } = useAuthStore();

  console.log('🔍 ONBOARDING ROUTE - isAuthenticated:', isAuthenticated);
  console.log('🔍 ONBOARDING ROUTE - needsEmailVerification:', needsEmailVerification);

  if (!isAuthenticated) {
    console.log('🔍 ONBOARDING ROUTE - Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Check email verification for all users (but not onboarding)
  if (needsEmailVerification) {
    console.log('🔍 ONBOARDING ROUTE - Needs email verification, redirecting...');
    return <Navigate to="/verify-email" replace />;
  }

  console.log('🔍 ONBOARDING ROUTE - Rendering onboarding component...');
  return children;
}

/**
 * Public Route Component (redirects if authenticated)
 */
function PublicRoute({ children }) {
  const { isAuthenticated, user, needsOnboarding, needsEmailVerification } = useAuthStore();

  console.log('🔍 PUBLIC ROUTE - isAuthenticated:', isAuthenticated);
  console.log('🔍 PUBLIC ROUTE - needsOnboarding:', needsOnboarding);
  console.log('🔍 PUBLIC ROUTE - needsEmailVerification:', needsEmailVerification);

  if (isAuthenticated) {
    // Check email verification first (for ALL roles, not just employees)
    if (needsEmailVerification) {
      console.log('🔍 PUBLIC ROUTE - Redirecting to email verification...');
      return <Navigate to="/verify-email" replace />;
    }
    
    // Check onboarding completion for all users  
    if (needsOnboarding) {
      console.log('🔍 PUBLIC ROUTE - Redirecting to onboarding...');
      return <Navigate to="/onboarding" replace />;
    }
    
    // Redirect to role-based dashboard
    const dashboardPath = getRoleBasedDashboard(user?.role);
    console.log('🔍 PUBLIC ROUTE - Redirecting to dashboard:', dashboardPath);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}

/**
 * Main App Component
 */
function App() {
  const { isAuthenticated, initializeAuth, isLoading: authLoading } = useAuthStore();
  const { initializeWellnessData, clearAllData } = useWellnessStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize wellness data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeWellnessData();
    } else {
      clearAllData();
    }
  }, [isAuthenticated, initializeWellnessData, clearAllData]);

  // Show loading screen during initial auth check
  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
          <div className="App min-h-screen bg-gray-50">
            <AnimatePresence mode="wait" initial={false}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <AuthLayout key="login">
                      <Login />
                    </AuthLayout>
                  </PublicRoute>
                } />
                
                <Route path="/register" element={
                  <PublicRoute>
                    <AuthLayout key="register">
                      <Register />
                    </AuthLayout>
                  </PublicRoute>
                } />
                
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <AuthLayout>
                      <ForgotPassword />
                    </AuthLayout>
                  </PublicRoute>
                } />
                
                <Route path="/reset-password" element={
                  <PublicRoute>
                    <AuthLayout>
                      <ResetPassword />
                    </AuthLayout>
                  </PublicRoute>
                } />

                <Route path="/verify-email" element={
                  <EmailVerification />
                } />

                {/* Onboarding Route */}
                <Route path="/onboarding" element={
                  <OnboardingRoute>
                    <Onboarding />
                  </OnboardingRoute>
                } />

                {/* Employee-Only Routes */}
                <Route path="/employee/dashboard" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <EmployeeDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/checkin" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <CheckIn />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/surveys" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Surveys />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/rewards" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Rewards />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/challenges" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Challenges />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/resources" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Resources />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/employee/resources/:id" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <ResourceView />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/journal" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Journal />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/employee/leaderboard" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DashboardLayout>
                      <Leaderboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* HR-Only Routes */}
                <Route path="/hr/dashboard" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <HRDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hr/analytics" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <HRAnalytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hr/employees" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Management</h2>
                        <p className="text-gray-600">HR employee management interface coming soon...</p>
                      </div>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hr/resources" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <ResourceManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hr/challenges" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <ChallengeManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/hr/surveys" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <DashboardLayout>
                      <SurveyManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Admin-Only Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminSettings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">System Analytics</h2>
                        <p className="text-gray-600">Admin analytics interface coming soon...</p>
                      </div>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/hr-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <HRManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/resources" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ResourceManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/challenges" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <ChallengeManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/surveys" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <SurveyManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/rewards" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <RewardManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Profile Route - Available to All Roles */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Default Route */}
                <Route path="/" element={
                  <Navigate to={isAuthenticated ? getRoleBasedDashboard(useAuthStore.getState().user?.role) : "/login"} replace />
                } />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
                
                {/* Error route */}
                <Route path="/error" element={<ServerError />} />
              </Routes>
            </AnimatePresence>
          </div>
          </Router>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
