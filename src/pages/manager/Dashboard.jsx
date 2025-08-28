import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Globe,
  Calendar,
  Clock,
  Building2,
  Star,
  Target,
  Zap,
  Heart,
  MessageSquare,
  BookOpen,
  Award,
  Shield,
  Eye
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import IntegrationStats from '../../components/integration/IntegrationStats';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    platformOverview: null,
    userStats: null,
    engagementMetrics: null,
    wellnessStats: null,
    businessMetrics: null,
    recentActivity: []
  });

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        companyOverview,
        hrAnalytics,
        engagementData,
        teamOverview
      ] = await Promise.all([
        api.getCompanyOverview().catch(err => ({ success: false, data: null })),
        api.getRiskAssessment().catch(err => ({ success: false, data: null })),
        api.getEngagementMetrics().catch(err => ({ success: false, data: null })),
        api.getTeamOverview().catch(err => ({ success: false, data: null }))
      ]);

      // Mock some additional platform-level data that would come from a manager-specific endpoint
      const platformData = {
        totalUsers: 247,
        totalManagers: 3,
        totalHR: 8,
        totalAdmins: 2,
        totalEmployees: 234,
        activeUsers: 198,
        monthlyGrowth: 12.5,
        engagement: 78.4,
        satisfaction: 85.2,
        platformHealth: 94.1
      };

      setDashboardData({
        platformOverview: platformData,
        userStats: companyOverview.success ? companyOverview.data : null,
        engagementMetrics: engagementData.success ? engagementData.data : null,
        wellnessStats: hrAnalytics.success ? hrAnalytics.data : null,
        teamOverview: teamOverview.success ? teamOverview.data : null,
        recentActivity: [
          { type: 'user_signup', message: 'New employee John Doe joined', time: '2 hours ago' },
          { type: 'survey_complete', message: '85% completion rate on Q1 Survey', time: '4 hours ago' },
          { type: 'milestone', message: 'Platform reached 250 users', time: '1 day ago' },
          { type: 'alert', message: 'High stress levels in Engineering dept', time: '2 days ago' }
        ]
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Manager Dashboard..." />;
  }

  const { platformOverview, userStats, engagementMetrics, wellnessStats, recentActivity } = dashboardData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name}! 👋`}
        subtitle="Your complete SaaS platform overview"
        icon={Users}
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Platform Users</p>
              <p className="text-2xl font-bold text-gray-900">{platformOverview?.totalUsers || 0}</p>
              <p className="text-xs text-green-600">+{platformOverview?.monthlyGrowth || 0}% this month</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{platformOverview?.activeUsers || 0}</p>
              <p className="text-xs text-gray-500">
                {platformOverview ? Math.round((platformOverview.activeUsers / platformOverview.totalUsers) * 100) : 0}% engagement
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Platform Health</p>
              <p className="text-2xl font-bold text-gray-900">{platformOverview?.platformHealth || 0}%</p>
              <p className="text-xs text-green-600">Excellent</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star size={24} className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-gray-900">{platformOverview?.satisfaction || 0}%</p>
              <p className="text-xs text-green-600">Above average</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Role Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Managers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{platformOverview?.totalManagers || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">HR Staff</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{platformOverview?.totalHR || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Admins</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{platformOverview?.totalAdmins || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart size={16} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Employees</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">{platformOverview?.totalEmployees || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wellness Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Wellness Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Mood Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">3.8/5</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">82%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Survey Participation</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm font-bold text-gray-900">68%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Level Distribution</span>
              <div className="flex space-x-1">
                <div className="w-2 h-8 bg-green-400 rounded"></div>
                <div className="w-2 h-6 bg-yellow-400 rounded"></div>
                <div className="w-2 h-4 bg-orange-400 rounded"></div>
                <div className="w-2 h-2 bg-red-400 rounded"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Integration Stats and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <IntegrationStats />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'user_signup' ? 'bg-green-100' :
                  activity.type === 'survey_complete' ? 'bg-blue-100' :
                  activity.type === 'milestone' ? 'bg-purple-100' :
                  'bg-yellow-100'
                }`}>
                  {activity.type === 'user_signup' && <Users size={16} className="text-green-600" />}
                  {activity.type === 'survey_complete' && <BarChart3 size={16} className="text-blue-600" />}
                  {activity.type === 'milestone' && <Target size={16} className="text-purple-600" />}
                  {activity.type === 'alert' && <AlertTriangle size={16} className="text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button className="w-full p-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all">
            <Users size={20} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <button className="w-full p-4 bg-white border border-gray-200 hover:border-green-300 hover:shadow-md rounded-xl transition-all">
            <BarChart3 size={20} className="text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Analytics</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button className="w-full p-4 bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md rounded-xl transition-all">
            <Shield size={20} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">System Settings</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <button className="w-full p-4 bg-white border border-gray-200 hover:border-yellow-300 hover:shadow-md rounded-xl transition-all">
            <Activity size={20} className="text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Platform Health</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default ManagerDashboard;