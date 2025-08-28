import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  HeartIcon,
  ActivityIcon,
  FileTextIcon,
  CalendarIcon,
  BarChart3Icon,
  RefreshCwIcon,
  FilterIcon,
  EyeIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import StatCard from '../../components/shared/StatCard';
import TabNavigation from '../../components/shared/TabNavigation';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function TeamManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamOverview, setTeamOverview] = useState(null);
  const [moodTrend, setMoodTrend] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [surveyParticipation, setSurveyParticipation] = useState(null);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadTeamData();
  }, [activeTab, timeframe]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          const overview = await api.getTeamOverview();
          setTeamOverview(overview.success ? overview.data : null);
          break;
          
        case 'mood':
          const mood = await api.getTeamMoodTrend();
          setMoodTrend(mood.success ? mood.data : null);
          break;
          
        case 'risk':
          const risk = await api.getTeamRiskAssessment();
          setRiskAssessment(risk.success ? risk.data : null);
          break;
          
        case 'surveys':
          const surveys = await api.getTeamSurveyParticipation();
          setSurveyParticipation(surveys.success ? surveys.data : null);
          break;
          
        case 'engagement':
          const engagement = await api.getTeamEngagementMetrics();
          setEngagementMetrics(engagement.success ? engagement.data : null);
          break;
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!teamOverview) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            value={teamOverview.totalMembers || 0}
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Active This Week"
            value={teamOverview.activeThisWeek || 0}
            icon={ActivityIcon}
            trend={teamOverview.trends?.activity}
            color="green"
          />
          <StatCard
            title="Average Mood"
            value={(teamOverview.averageMood || 0).toFixed(1)}
            icon={HeartIcon}
            trend={teamOverview.trends?.mood}
            color="purple"
          />
          <StatCard
            title="At Risk"
            value={teamOverview.atRiskMembers || 0}
            icon={AlertTriangleIcon}
            trend={teamOverview.trends?.risk}
            color="red"
          />
        </div>

        {/* Team Member List */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
          
          {teamOverview.members?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamOverview.members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.lastCheckIn ? new Date(member.lastCheckIn).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'at-risk'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-sage-600 hover:text-sage-900">
                          <EyeIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No team members found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMoodTab = () => {
    if (!moodTrend) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Mood Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Team Average"
            value={(moodTrend.averageMood || 0).toFixed(1)}
            icon={HeartIcon}
            trend={moodTrend.trends?.average}
            color="purple"
          />
          <StatCard
            title="Positive Trends"
            value={moodTrend.positiveTrends || 0}
            icon={TrendingUpIcon}
            color="green"
          />
          <StatCard
            title="Negative Trends"
            value={moodTrend.negativeTrends || 0}
            icon={TrendingDownIcon}
            color="red"
          />
        </div>

        {/* Mood Distribution */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Mood Distribution</h3>
          
          {moodTrend.distribution && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(moodTrend.distribution).map(([mood, count]) => (
                <div key={mood} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">
                    {mood === 'very_happy' ? '😄' : 
                     mood === 'happy' ? '😊' :
                     mood === 'neutral' ? '😐' :
                     mood === 'sad' ? '😢' : '😞'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{mood.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Mood Changes */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Mood Changes</h3>
          
          {moodTrend.recentChanges?.length > 0 ? (
            <div className="space-y-3">
              {moodTrend.recentChanges.map((change, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {change.employee?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{change.employee}</p>
                      <p className="text-xs text-gray-500">{new Date(change.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {change.previousMood} → {change.currentMood}
                    </span>
                    {change.trend === 'up' ? (
                      <TrendingUpIcon size={16} className="text-green-500" />
                    ) : (
                      <TrendingDownIcon size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3Icon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent mood changes</p>
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

        {/* At-Risk Team Members */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">At-Risk Team Members</h3>
          
          {riskAssessment.atRiskMembers?.length > 0 ? (
            <div className="space-y-4">
              {riskAssessment.atRiskMembers.map((member) => (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.riskLevel === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.riskLevel} risk
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Last Check-in:</span>
                      <span className="ml-1 font-medium">
                        {member.lastCheckIn ? new Date(member.lastCheckIn).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Mood:</span>
                      <span className="ml-1 font-medium">{member.averageMood?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Factors:</span>
                      <span className="ml-1 font-medium">{member.riskFactors?.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HeartIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No at-risk team members</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSurveysTab = () => {
    if (!surveyParticipation) return <LoadingState />;

    return (
      <div className="space-y-6">
        {/* Survey Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Response Rate"
            value={`${(surveyParticipation.responseRate || 0).toFixed(1)}%`}
            icon={FileTextIcon}
            trend={surveyParticipation.trends?.responseRate}
            color="blue"
          />
          <StatCard
            title="Active Surveys"
            value={surveyParticipation.activeSurveys || 0}
            icon={ActivityIcon}
            color="green"
          />
          <StatCard
            title="Total Responses"
            value={surveyParticipation.totalResponses || 0}
            icon={BarChart3Icon}
            trend={surveyParticipation.trends?.responses}
            color="purple"
          />
        </div>

        {/* Survey Participation Details */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Survey Participation</h3>
          
          {surveyParticipation.surveys?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Survey
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Responses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surveyParticipation.surveys.map((survey) => (
                    <tr key={survey.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {survey.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {survey.teamResponses} / {survey.teamSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((survey.teamResponses / survey.teamSize) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          survey.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {survey.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileTextIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No surveys available</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Check-in Rate"
            value={`${(engagementMetrics.checkInRate || 0).toFixed(1)}%`}
            icon={ActivityIcon}
            trend={engagementMetrics.trends?.checkIn}
            color="blue"
          />
          <StatCard
            title="Survey Participation"
            value={`${(engagementMetrics.surveyParticipation || 0).toFixed(1)}%`}
            icon={FileTextIcon}
            trend={engagementMetrics.trends?.survey}
            color="green"
          />
          <StatCard
            title="Active Streaks"
            value={engagementMetrics.activeStreaks || 0}
            icon={TrendingUpIcon}
            color="purple"
          />
          <StatCard
            title="Coins Earned"
            value={engagementMetrics.totalCoinsEarned || 0}
            icon={HeartIcon}
            trend={engagementMetrics.trends?.coins}
            color="yellow"
          />
        </div>

        {/* Top Performers */}
        <div className="card-glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
          
          {engagementMetrics.topPerformers?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagementMetrics.topPerformers.map((performer, index) => (
                <div key={performer.id} className="p-4 bg-gradient-to-br from-sage-50 to-sage-100 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-medium">
                      {performer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{performer.name}</h4>
                      <p className="text-xs text-gray-500">#{index + 1} Team Performer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-ins:</span>
                      <span className="font-medium">{performer.checkIns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Streak:</span>
                      <span className="font-medium">{performer.streak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coins:</span>
                      <span className="font-medium text-sage-600">{performer.coins}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUpIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No performance data available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !teamOverview && !moodTrend && !riskAssessment && !surveyParticipation && !engagementMetrics) {
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
        title="Team Management"
        subtitle="Monitor and manage your team's wellness and engagement"
        icon={UsersIcon}
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
              onClick={loadTeamData}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'overview', label: 'Overview', icon: UsersIcon },
          { id: 'mood', label: 'Mood Trends', icon: HeartIcon },
          { id: 'risk', label: 'Risk Assessment', icon: AlertTriangleIcon },
          { id: 'surveys', label: 'Survey Participation', icon: FileTextIcon },
          { id: 'engagement', label: 'Engagement', icon: ActivityIcon }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'mood' && renderMoodTab()}
      {activeTab === 'risk' && renderRiskTab()}
      {activeTab === 'surveys' && renderSurveysTab()}
      {activeTab === 'engagement' && renderEngagementTab()}
    </motion.div>
  );
}

export default TeamManagement;