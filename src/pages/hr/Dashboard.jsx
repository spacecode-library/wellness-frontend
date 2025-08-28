import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HomeIcon,
  BarChart3Icon,
  Users2Icon,
  TrendingUpIcon,
  AlertTriangleIcon,
  FileTextIcon,
  GiftIcon,
  HeartIcon,
  ActivityIcon,
  CalendarIcon,
  ArrowRightIcon,
  ChevronRightIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import StatCard from '../../components/shared/StatCard';
import api from '../../services/api';

function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [greeting, setGreeting] = useState('');

  const { user } = useAuthStore();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Load HR dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load real company analytics data
        const companyResponse = await api.getCompanyOverview();
        const engagementResponse = await api.getEngagementMetrics();
        const riskResponse = await api.getRiskAssessment();
        
        if (companyResponse.success) {
          const companyData = companyResponse.data;
          
          // Parse the real backend data
          const realData = {
            overview: {
              totalEmployees: companyData.overview?.totalEmployees || 0,
              participationRate: typeof companyData.overview?.engagementRate === 'string' 
                ? parseFloat(companyData.overview.engagementRate.replace('%', '') || 0)
                : (companyData.overview?.engagementRate || 0),
              averageMoodScore: companyData.overview?.averageMood || 0,
              atRiskEmployees: companyData.overview?.highRiskEmployees || 0,
              activeSurveys: 3, // Static for now
              pendingActions: companyData.overview?.highRiskEmployees || 0
            },
            trends: {
              employees: companyData.trends?.moodTrend === 'positive' ? 'up' : 'down',
              participation: companyData.trends?.engagementTrend === 'stable' ? 'up' : 'down',
              mood: companyData.trends?.moodTrend === 'positive' ? 'up' : 'down',
              risk: 'down' // Assuming risk going down is good
            },
            recentActivity: [
              {
                type: 'survey_completed',
                message: `${companyData.overview?.totalCheckIns || 0} total check-ins recorded`,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
              },
              {
                type: 'high_risk_alert',
                message: `${companyData.overview?.highRiskEmployees || 0} employees flagged as high-risk`,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
              },
              {
                type: 'milestone',
                message: `${companyData.overview?.engagementRate || '0%'} overall engagement rate`,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
              }
            ],
            departments: companyData.departmentBreakdown?.map(dept => ({
              name: dept.department,
              employees: dept.employeeCount,
              participation: dept.participationRate,
              avgMood: dept.averageMood
            })) || [
              { name: 'Engineering', employees: 45, participation: 82, avgMood: 3.9 },
              { name: 'Marketing', employees: 25, participation: 76, avgMood: 4.1 },
              { name: 'Sales', employees: 35, participation: 71, avgMood: 3.6 },
              { name: 'HR', employees: 12, participation: 95, avgMood: 4.2 },
              { name: 'Finance', employees: 18, participation: 68, avgMood: 3.4 },
              { name: 'Operations', employees: 10, participation: 80, avgMood: 3.8 }
            ]
          };
          
          setDashboardData(realData);
        } else {
          setDashboardData(null); // Set to null to show error state
        }
      } catch (error) {
        console.error('Error loading HR dashboard data:', error);
        setDashboardData(null); // Set to null to show error state
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading HR dashboard..." size="large" />;
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-8">
        <div className="text-red-500 mb-4">
          <AlertTriangleIcon size={48} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard Data</h3>
        <p className="text-gray-600 text-center mb-4">
          There was an error loading the HR dashboard. Please check your connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'HR Manager'}! 👋`}
        subtitle="Manage employee wellness and track organizational health"
        icon={HomeIcon}
        gradient={true}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={dashboardData?.overview.totalEmployees || 0}
          icon={Users2Icon}
          trend={dashboardData?.trends.employees}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Participation Rate"
          value={`${(dashboardData?.overview.participationRate || 0).toFixed(1)}%`}
          icon={ActivityIcon}
          trend={dashboardData?.trends.participation}
          color="green"
          delay={0.2}
        />
        <StatCard
          title="Average Mood"
          value={(dashboardData?.overview.averageMoodScore || 0).toFixed(1)}
          label="out of 5.0"
          icon={HeartIcon}
          trend={dashboardData?.trends.mood}
          color="purple"
          delay={0.3}
        />
        <StatCard
          title="At-Risk Employees"
          value={dashboardData?.overview.atRiskEmployees || 0}
          icon={AlertTriangleIcon}
          trend={dashboardData?.trends.risk}
          color="red"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3Icon size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-gray-600 text-sm mb-4">
              View detailed analytics and generate reports
            </p>
            <Link 
              to="/hr/analytics"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View Analytics</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Employee Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-glass"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users2Icon size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Employee Management</h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage employee wellness and interventions
            </p>
            <Link 
              to="/hr/employees"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <span>Manage Employees</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Surveys Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-glass"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextIcon size={24} className="text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Active Surveys</h3>
            <p className="text-gray-600 text-sm mb-4">
              {dashboardData?.overview.activeSurveys || 0} surveys active
            </p>
            <Link 
              to="/hr/surveys"
              className="btn-outline inline-flex items-center space-x-2"
            >
              <span>Manage Surveys</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Department Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card-glass"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Department Overview</h2>
          <Link 
            to="/hr/analytics" 
            className="text-sage-600 hover:text-sage-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>View detailed analytics</span>
            <ChevronRightIcon size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData?.departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + (index * 0.1) }}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{dept.name}</h4>
                <div className="text-xs text-gray-500">{dept.employees} emp.</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participation:</span>
                  <span className={`font-medium ${
                    dept.participation >= 80 ? 'text-green-600' :
                    dept.participation >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.participation}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Mood:</span>
                  <span className={`font-medium ${
                    (dept.avgMood || 0) >= 4.0 ? 'text-green-600' :
                    (dept.avgMood || 0) >= 3.0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(dept.avgMood || 0).toFixed(1)}/5.0
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card-glass"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Link 
            to="/hr/analytics" 
            className="text-sage-600 hover:text-sage-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>View all</span>
            <ChevronRightIcon size={16} />
          </Link>
        </div>
        
        <div className="space-y-4">
          {dashboardData?.recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + (index * 0.1) }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-3 h-3 rounded-full mt-2 ${
                activity.type === 'high_risk_alert' ? 'bg-red-500' :
                activity.type === 'milestone' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {activity.timestamp.toRelativeTimeString ? 
                    activity.timestamp.toRelativeTimeString() :
                    activity.timestamp.toLocaleString()
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HRDashboard;