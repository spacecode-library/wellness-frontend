import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  CalendarIcon, 
  UsersIcon, 
  TargetIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ActivityIcon,
  TrendingUpIcon,
  AwardIcon,
  XCircleIcon,
  RefreshCwIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState({});
  const [activeTab, setActiveTab] = useState('available');

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
    loadUserChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await api.getActiveChallenges();
      if (response.success) {
        setChallenges(response.data.challenges || []);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges', 'Error');
    }
  };

  const loadUserChallenges = async () => {
    try {
      const response = await api.getUserChallenges();
      if (response.success && response.data.challenges) {
        setUserChallenges(response.data.challenges);
      } else {
        setUserChallenges([]);
      }
    } catch (error) {
      console.error('Error loading user challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    setJoinLoading(prev => ({ ...prev, [challengeId]: true }));
    
    try {
      const response = await api.joinChallenge(challengeId);
      if (response.success) {
        toast.success('Successfully joined challenge!', 'Welcome aboard!');
        await loadChallenges();
        await loadUserChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      const message = error.message;
      if (message.includes('not accepting new participants')) {
        toast.error('This challenge is not currently accepting new participants. It may have already started or reached capacity.', 'Cannot Join');
      } else if (message.includes('already participating')) {
        toast.error('You are already participating in this challenge', 'Already Joined');
      } else if (message.includes('not eligible')) {
        toast.error('You are not eligible for this challenge', 'Not Eligible');
      } else {
        toast.error(message || 'Failed to join challenge', 'Error');
      }
    } finally {
      setJoinLoading(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const updateProgress = async (challengeId, progress) => {
    try {
      const response = await api.updateChallengeProgress(challengeId, progress);
      if (response.success) {
        toast.success('Progress updated!', 'Great job!');
        await loadUserChallenges();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress', 'Error');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'fitness': return ActivityIcon;
      case 'mental-health': return HeartIcon;
      case 'nutrition': return StarIcon;
      case 'social': return UsersIcon;
      default: return TargetIcon;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fitness': return 'text-blue-600 bg-blue-100';
      case 'mental-health': return 'text-purple-600 bg-purple-100';
      case 'nutrition': return 'text-green-600 bg-green-100';
      case 'social': return 'text-sage-600 bg-sage-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderAvailableChallenges = () => (
    <div className="space-y-6">
      {challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const CategoryIcon = getCategoryIcon(challenge.category);
            const isJoined = userChallenges.some(uc => uc._id === challenge._id);
            
            return (
              <motion.div
                key={challenge._id}
                className="card-glass hover:shadow-lg transition-shadow duration-300"
                whileHover={{ y: -4 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getCategoryColor(challenge.category)}`}>
                      <CategoryIcon size={24} />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-semibold text-gray-900">{challenge.duration?.days || challenge.duration} days</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UsersIcon size={16} className="mr-1" />
                        {challenge.participants?.length || 0} joined
                      </div>
                      <div className="flex items-center">
                        <HeartIcon size={16} className="mr-1" />
                        {challenge.reward} coins
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Starts:</span>
                      <span className="ml-1 font-medium">
                        {new Date(challenge.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {isJoined ? (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircleIcon size={16} className="mr-1" />
                        Joined
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={joinLoading[challenge._id]}
                        className="btn-primary text-sm"
                      >
                        {joinLoading[challenge._id] ? (
                          <RefreshCwIcon size={16} className="animate-spin" />
                        ) : (
                          <PlayIcon size={16} />
                        )}
                        Join Challenge
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass text-center py-12">
          <TargetIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Challenges</h3>
          <p className="text-gray-500">New challenges will appear here soon!</p>
        </div>
      )}
    </div>
  );

  const renderMyChallenges = () => (
    <div className="space-y-6">
      {userChallenges.length > 0 ? (
        <div className="space-y-4">
          {userChallenges.map((challenge) => {
            const CategoryIcon = getCategoryIcon(challenge.category);
            const progressPercentage = (challenge.progress / challenge.target) * 100;
            
            return (
              <motion.div
                key={challenge._id}
                className="card-glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(challenge.category)}`}>
                        <CategoryIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon size={16} className="mr-1" />
                            {challenge.duration?.days || challenge.duration} days
                          </div>
                          <div className="flex items-center">
                            <UsersIcon size={16} className="mr-1" />
                            {challenge.participants} participants
                          </div>
                          <div className="flex items-center">
                            <HeartIcon size={16} className="mr-1" />
                            {challenge.reward} coins
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {challenge.status === 'completed' ? (
                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          <TrophyIcon size={16} className="mr-1" />
                          Completed
                        </div>
                      ) : challenge.status === 'active' ? (
                        <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                          <ClockIcon size={16} className="mr-1" />
                          In Progress
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm font-medium">
                          <XCircleIcon size={16} className="mr-1" />
                          Not Started
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">
                        {challenge.progress}/{challenge.target} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-sage-500 to-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progressPercentage.toFixed(0)}% complete
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {challenge.status === 'active' && challenge.progress < challenge.target && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => updateProgress(challenge._id, challenge.progress + 1)}
                        className="btn-primary text-sm"
                      >
                        <CheckCircleIcon size={16} />
                        Mark Today Complete
                      </button>
                      <button className="btn-secondary text-sm">
                        View Details
                      </button>
                    </div>
                  )}

                  {challenge.status === 'completed' && (
                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <AwardIcon size={20} className="text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-green-900">
                            Congratulations! Challenge completed!
                          </div>
                          <div className="text-sm text-green-700">
                            You earned {challenge.reward} Happy Coins on{' '}
                            {new Date(challenge.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass text-center py-12">
          <TargetIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Challenges Yet</h3>
          <p className="text-gray-500 mb-4">
            Join some challenges from the Available tab to start your wellness journey!
          </p>
          <button
            onClick={() => setActiveTab('available')}
            className="btn-primary"
          >
            Browse Challenges
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
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
        title="Wellness Challenges"
        subtitle="Join challenges, track progress, and earn rewards"
        icon={TrophyIcon}
      />

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-glass">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <TargetIcon size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userChallenges.length}
                </div>
                <div className="text-sm text-gray-500">Joined Challenges</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <TrophyIcon size={24} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userChallenges.filter(c => c.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <HeartIcon size={24} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userChallenges.reduce((sum, c) => c.status === 'completed' ? sum + c.reward : sum, 0)}
                </div>
                <div className="text-sm text-gray-500">Coins Earned</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <TrendingUpIcon size={24} className="text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userChallenges.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-glass">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available'
                  ? 'border-sage-500 text-sage-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Challenges
            </button>
            <button
              onClick={() => setActiveTab('my-challenges')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-challenges'
                  ? 'border-sage-500 text-sage-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Challenges ({userChallenges.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'available' && renderAvailableChallenges()}
          {activeTab === 'my-challenges' && renderMyChallenges()}
        </div>
      </div>
    </motion.div>
  );
}

export default Challenges;