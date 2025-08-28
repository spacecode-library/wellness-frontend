import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  UsersIcon,
  HeartIcon,
  AlertTriangleIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  RefreshCwIcon,
  BuildingIcon,
  ActivityIcon,
  FileTextIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import StatCard from '../../components/shared/StatCard';
import TabNavigation from '../../components/shared/TabNavigation';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function HRAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exportingData, setExportingData] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { user } = useAuthStore();
  const { toast } = useToast();

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'HR', 
    'Finance', 'Operations', 'Product'
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [activeTab, timeframe, selectedDepartment]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const dateParams = getDateRangeParams(timeframe);
      
      switch (activeTab) {
        case 'overview':
          const overview = await api.getCompanyOverview(dateParams);
          setAnalytics(overview.success ? overview.data : null);
          break;
          
        case 'risk':
          const risk = await api.getRiskAssessment({
            ...dateParams,
            department: selectedDepartment || undefined
          });
          setRiskAssessment(risk.success ? risk.data : null);
          break;
          
        case 'engagement':
          const engagement = await api.getEngagementMetrics({
            period: parseInt(timeframe.replace('d', ''))
          });
          setEngagementMetrics(engagement.success ? engagement.data : null);
          break;
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeParams = (timeframe) => {
    const days = parseInt(timeframe.replace('d', ''));
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const handleExport = async (format = 'csv') => {
    setExportingData(true);
    try {
      const params = {
        format,
        type: activeTab,
        ...getDateRangeParams(timeframe),
        department: selectedDepartment || undefined
      };
      
      const result = await api.exportAnalytics(params);
      
      if (result.success) {
        // Create download link
        if (result.data.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.data.downloadUrl;
          link.download = `wellness-analytics-${activeTab}-${timeframe}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        toast.success('Analytics data exported successfully', 'Export Complete');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data', 'Export Error');
    } finally {
      setExportingData(false);
    }
  };

  const renderOverviewTab = () => {
    if (!analytics) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={analytics.totalEmployees || 0}
            icon={UsersIcon}
            trend={analytics.trends?.employees}
            color="blue"
          />
          <StatCard
            title="Participation Rate"
            value={`${(analytics.participationRate || 0).toFixed(1)}%`}
            icon={ActivityIcon}
            trend={analytics.trends?.participation}
            color="green"
          />
          <StatCard
            title="Average Mood"
            value={(analytics.averageMoodScore || 0).toFixed(1)}
            icon={HeartIcon}
            trend={analytics.trends?.mood}
            color="purple"
          />
          <StatCard
            title="At-Risk Employees"
            value={analytics.atRiskEmployees || 0}
            icon={AlertTriangleIcon}
            trend={analytics.trends?.risk}
            color="red"
          />
        </div>

        {/* Department Breakdown */}
        <div className="card-glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Department Overview</h3>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-primary"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {analytics.departmentBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.departmentBreakdown).map(([dept, data]) => (
                <div key={dept} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{dept}</h4>
                    <BuildingIcon size={16} className="text-gray-400" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-medium">{data.employeeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participation:</span>
                      <span className="font-medium">{(data.participationRate || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Mood:</span>
                      <span className="font-medium">{(data.averageMood || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRiskTab = () => {
    if (!riskAssessment) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="High Risk"
            value={riskAssessment.summary?.highRisk || 0}
            icon={AlertTriangleIcon}
            color="red"
          />
          <StatCard
            title="Medium Risk"
            value={riskAssessment.summary?.mediumRisk || 0}
            icon={AlertTriangleIcon}
            color="yellow"
          />
          <StatCard
            title="Low Risk"
            value={riskAssessment.summary?.lowRisk || 0}
            icon={HeartIcon}
            color="green"
          />
        </div>

        {/* At-Risk Employees List */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">At-Risk Employees</h3>
          
          {riskAssessment.employees?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riskAssessment.employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.riskLevel === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : employee.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {employee.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.lastCheckIn ? new Date(employee.lastCheckIn).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-sage-600 hover:text-sage-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangleIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No at-risk employees found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEngagementTab = () => {
    if (!engagementMetrics) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Check-in Rate"
            value={`${(engagementMetrics.checkInRate || 0).toFixed(1)}%`}
            icon={ActivityIcon}
            trend={engagementMetrics.trends?.checkIn}
            color="blue"
          />
          <StatCard
            title="Survey Response Rate"
            value={`${(engagementMetrics.surveyResponseRate || 0).toFixed(1)}%`}
            icon={FileTextIcon}
            trend={engagementMetrics.trends?.survey}
            color="green"
          />
          <StatCard
            title="Active Streaks"
            value={engagementMetrics.activeStreaks || 0}
            icon={TrendingUpIcon}
            trend={engagementMetrics.trends?.streaks}
            color="purple"
          />
          <StatCard
            title="Happy Coins Earned"
            value={engagementMetrics.totalCoinsEarned || 0}
            icon={HeartIcon}
            trend={engagementMetrics.trends?.coins}
            color="yellow"
          />
        </div>

        {/* Engagement Details */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Details</h3>
          
          {engagementMetrics.details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Performing Departments</h4>
                <div className="space-y-2">
                  {engagementMetrics.details.topDepartments?.map((dept, index) => (
                    <div key={dept.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{index + 1}. {dept.name}</span>
                      <span className="text-sm text-gray-600">{(dept.engagementRate || 0).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {engagementMetrics.details.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-sage-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !analytics && !riskAssessment && !engagementMetrics) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <PageHeader
        title="HR Analytics"
        subtitle="Comprehensive wellness insights and employee analytics"
        icon={BarChart3Icon}
        actions={
          <div className="flex items-center space-x-3">
            {/* Timeframe Selector */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Export Button */}
            <button
              onClick={() => handleExport('csv')}
              disabled={exportingData}
              className="btn-primary"
            >
              <DownloadIcon size={16} />
              {exportingData ? 'Exporting...' : 'Export'}
            </button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'overview', label: 'Overview', icon: BarChart3Icon },
          { id: 'risk', label: 'Risk Assessment', icon: AlertTriangleIcon },
          { id: 'engagement', label: 'Engagement', icon: ActivityIcon }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'risk' && renderRiskTab()}
      {activeTab === 'engagement' && renderEngagementTab()}
    </motion.div>
  );
}

export default HRAnalytics;