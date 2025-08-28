import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquareIcon, 
  UsersIcon, 
  TrendingUpIcon,
  MailIcon,
  ChartBarIcon,
  ExternalLinkIcon
} from 'lucide-react';
import api from '../../services/api';

function IntegrationStats({ teamData = null }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrationStats();
  }, []);

  const fetchIntegrationStats = async () => {
    try {
      const response = await api.getIntegrationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch integration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdoptionRate = () => {
    if (!stats?.totalUsers || stats.totalUsers === 0) return 0;
    return Math.round((stats.slack?.connectedCount / stats.totalUsers) * 100);
  };

  const getChannelComparison = () => {
    if (!stats?.channelMetrics) return { slack: 0, email: 0 };
    
    const total = stats.channelMetrics.slack + stats.channelMetrics.email;
    if (total === 0) return { slack: 0, email: 0 };
    
    return {
      slack: Math.round((stats.channelMetrics.slack / total) * 100),
      email: Math.round((stats.channelMetrics.email / total) * 100)
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const adoptionRate = calculateAdoptionRate();
  const channelComparison = getChannelComparison();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquareIcon size={24} className="text-sage-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Integration Overview
          </h3>
        </div>
        <button className="text-sm text-sage-600 hover:text-sage-700 flex items-center space-x-1">
          <span>View Details</span>
          <ExternalLinkIcon size={14} />
        </button>
      </div>

      {/* Adoption Rate */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Slack Adoption Rate</span>
          <span className="text-sm font-semibold text-gray-900">{adoptionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-sage-500 to-sage-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${adoptionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {stats?.slack?.connectedCount || 0} of {stats?.totalUsers || 0} employees connected
        </p>
      </div>

      {/* Channel Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Response Channel Distribution</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquareIcon size={16} className="text-sage-600" />
              <span className="text-sm text-gray-600">Slack Responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{channelComparison.slack}%</span>
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-sage-600 h-1.5 rounded-full"
                  style={{ width: `${channelComparison.slack}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MailIcon size={16} className="text-blue-600" />
              <span className="text-sm text-gray-600">Email Responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{channelComparison.email}%</span>
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${channelComparison.email}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sage-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUpIcon size={16} className="text-sage-600" />
            <span className="text-xs text-gray-600">Avg Response Time</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {stats?.slack?.avgResponseTime || '12'} min
          </p>
          <p className="text-xs text-green-600">
            {stats?.slack?.responseTimeComparison || '65%'} faster via Slack
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <ChartBarIcon size={16} className="text-gray-600" />
            <span className="text-xs text-gray-600">Response Rate</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {stats?.slack?.responseRate || '87'}%
          </p>
          <p className="text-xs text-gray-600">
            vs {stats?.email?.responseRate || '72'}% email
          </p>
        </div>
      </div>

      {/* Team-specific stats if available */}
      {teamData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Team</h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Slack Connected</span>
            <span className="text-sm font-medium text-gray-900">
              {teamData.slackConnected || 0} / {teamData.totalMembers || 0} members
            </span>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-4 p-3 bg-sage-50 rounded-lg">
        <p className="text-xs text-sage-700">
          <strong>Tip:</strong> Encourage team members to connect Slack for faster survey responses
        </p>
      </div>
    </motion.div>
  );
}

export default IntegrationStats;