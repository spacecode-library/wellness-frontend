import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquareIcon, 
  LinkIcon, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../shared/Toast';

function SlackIntegrationCard() {
  const [slackStatus, setSlackStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlackStatus();
  }, []);

  const fetchSlackStatus = async () => {
    try {
      setLoading(true);
      const response = await api.getSlackStatus();
      if (response.success) {
        setSlackStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch Slack status:', error);
      toast.error('Failed to load Slack connection status', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await api.connectSlack();
      
      if (response.success && response.data.authUrl) {
        // Redirect to Slack OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Failed to connect Slack:', error);
      toast.error('Failed to initiate Slack connection', 'Error');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const response = await api.disconnectSlack();
      
      if (response.success) {
        setSlackStatus({
          isConnected: false,
          userId: null,
          teamName: null,
          connectedAt: null
        });
        toast.success('Slack integration disconnected successfully', 'Success');
      }
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
      toast.error('Failed to disconnect Slack integration', 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-glass">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-glass"
    >
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquareIcon size={24} className="text-sage-600" />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Slack Integration
          </h3>
          <p className="text-sm text-gray-600">
            Connect Slack to receive surveys and check-ins directly
          </p>
        </div>
      </div>

      {slackStatus?.isConnected ? (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 size={20} className="text-sage-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sage-900">Connected to Slack</p>
                <p className="text-sm text-sage-700 mt-1">
                  Workspace: {slackStatus.teamName || 'Your Workspace'}
                </p>
                {slackStatus.connectedAt && (
                  <p className="text-xs text-sage-600 mt-1">
                    Connected since {new Date(slackStatus.connectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Active Benefits:</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-sage-600" />
                <span>Receive wellness surveys via Slack DM</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-sage-600" />
                <span>Quick mood check-ins with /quick-checkin</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-sage-600" />
                <span>Automated reminder notifications</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-sage-600" />
                <span>Real-time Happy Coins and streak updates</span>
              </li>
            </ul>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <XCircle size={18} />
            <span>Disconnect Slack</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Not Connected Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <LinkIcon size={20} className="text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Not Connected</p>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your Slack account to receive surveys and check-ins directly in Slack
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-sage-50 rounded-lg p-4">
            <h4 className="font-medium text-sage-900 mb-3">What you'll get:</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-sage-700">
                <MessageSquareIcon size={16} className="text-sage-600" />
                <span>Wellness surveys delivered to your Slack DM</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-sage-700">
                <MessageSquareIcon size={16} className="text-sage-600" />
                <span>Quick daily mood check-ins with slash commands</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-sage-700">
                <MessageSquareIcon size={16} className="text-sage-600" />
                <span>Instant notifications for new surveys</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-sage-700">
                <MessageSquareIcon size={16} className="text-sage-600" />
                <span>Track your wellness without leaving Slack</span>
              </li>
            </ul>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full btn-primary flex items-center justify-center space-x-2"
            disabled={connecting}
          >
            {connecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <MessageSquareIcon size={18} />
                <span>Connect Slack</span>
                <ExternalLink size={16} />
              </>
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center">
            We only access basic profile information and send direct messages. 
            Your private channels and messages remain private.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default SlackIntegrationCard;