import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  TrendingUpIcon, 
  CalendarIcon, 
  AwardIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  StarIcon,
  CoinsIcon,
  HomeIcon
} from 'lucide-react';
import useWellnessStore from '../../store/wellnessStore';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import StatCard from '../../components/shared/StatCard';
import ErrorState from '../../components/shared/ErrorState';
import { useCheckIn, useProfile, useSurveys } from '../../hooks/useApi';
import api from '../../services/api';

function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [checkInHistory, setCheckInHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [happyCoins, setHappyCoins] = useState(0);
  const [timeUntilNextCheckIn, setTimeUntilNextCheckIn] = useState('');
  const [canCheckInAgain, setCanCheckInAgain] = useState(false);

  const { user } = useAuthStore();
  const { getTodayCheckIn } = useCheckIn();
  const { getProfile } = useProfile();
  const { getActiveSurveys } = useSurveys();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Update happy coins when user data changes
  useEffect(() => {
    if (user?.wellness?.happyCoins !== undefined) {
      setHappyCoins(user.wellness.happyCoins);
    }
  }, [user?.wellness?.happyCoins]);

  // Calculate check-in availability and countdown timer (matching CheckIn.jsx format)
  useEffect(() => {
    const calculateCheckInAvailability = () => {
      if (!todayCheckIn) {
        setCanCheckInAgain(true);
        setTimeUntilNextCheckIn('');
        return;
      }

      const now = new Date();
      // Calculate time until next midnight (same as CheckIn.jsx)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeLeft = tomorrow.getTime() - now.getTime();
      
      if (timeLeft <= 0) {
        setCanCheckInAgain(true);
        setHasCheckedInToday(false);
        setTodayCheckIn(null);
        setTimeUntilNextCheckIn('');
      } else {
        setCanCheckInAgain(false);
        
        // Calculate hours, minutes, seconds (same logic as CheckIn.jsx)
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Format time exactly like CheckIn.jsx
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeUntilNextCheckIn(formattedTime);
      }
    };

    calculateCheckInAvailability();
    
    // Update every second
    const interval = setInterval(calculateCheckInAvailability, 1000);
    
    return () => clearInterval(interval);
  }, [todayCheckIn]);

  // Reset check-in status when it becomes available again
  useEffect(() => {
    if (canCheckInAgain && hasCheckedInToday) {
      // Refresh the page data when check-in becomes available again
      const checkForNewDay = async () => {
        try {
          const todayCheckInData = await getTodayCheckIn();
          if (!todayCheckInData) {
            setHasCheckedInToday(false);
            setTodayCheckIn(null);
            setTodayMood(null);
          }
        } catch (err) {
          // No check-in today, reset state
          setHasCheckedInToday(false);
          setTodayCheckIn(null);
          setTodayMood(null);
        }
      };
      
      checkForNewDay();
    }
  }, [canCheckInAgain, hasCheckedInToday, getTodayCheckIn]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load user profile and stats
        try {
          const profileData = await getProfile();
          setUserProfile(profileData);
          setHappyCoins(profileData.wellness?.happyCoins || 0);
        } catch (err) {
          console.warn('Failed to load profile:', err);
        }
        
        // Load today's check-in status
        try {
          const todayCheckInData = await getTodayCheckIn();
          if (todayCheckInData) {
            setTodayCheckIn(todayCheckInData);
            setHasCheckedInToday(true);
            setTodayMood(todayCheckInData.mood);
          }
        } catch (err) {
          console.log('No check-in today yet');
        }
        
        // Load active surveys
        try {
          const surveysData = await getActiveSurveys();
          setActiveSurveys(surveysData || []);
        } catch (err) {
          console.warn('Failed to load surveys:', err);
        }
        
        // Load check-in history (last 7 days)
        try {
          const historyResponse = await api.getCheckInHistory({ limit: 7 });
          console.log('🔍 DASHBOARD - Check-in history response:', historyResponse);
          console.log('🔍 DASHBOARD - History data type:', typeof historyResponse.data);
          console.log('🔍 DASHBOARD - History data is array:', Array.isArray(historyResponse.data));
          console.log('🔍 DASHBOARD - History data:', historyResponse.data);
          
          if (historyResponse.success) {
            // Handle different possible data structures
            let historyData = [];
            
            if (Array.isArray(historyResponse.data)) {
              // Direct array
              historyData = historyResponse.data;
            } else if (historyResponse.data && Array.isArray(historyResponse.data.checkIns)) {
              // Nested in checkIns property
              historyData = historyResponse.data.checkIns;
            } else if (historyResponse.data && Array.isArray(historyResponse.data.data)) {
              // Nested in data property
              historyData = historyResponse.data.data;
            } else {
              // Fallback to empty array
              historyData = [];
            }
            
            console.log('🔍 DASHBOARD - Final history data:', historyData);
            console.log('🔍 DASHBOARD - Final history data is array:', Array.isArray(historyData));
            setCheckInHistory(historyData);
          }
        } catch (err) {
          console.warn('Failed to load check-in history:', err);
          setCheckInHistory([]); // Ensure it's always an array
        }
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getProfile, getTodayCheckIn, getActiveSurveys]);

  const getMoodEmoji = (rating) => {
    const moods = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return moods[rating] || '😐';
  };

  const getStreakStats = () => {
    console.log('🔍 DASHBOARD - getStreakStats called, checkInHistory:', checkInHistory);
    console.log('🔍 DASHBOARD - checkInHistory type:', typeof checkInHistory);
    console.log('🔍 DASHBOARD - checkInHistory is array:', Array.isArray(checkInHistory));
    
    if (!checkInHistory || checkInHistory.length === 0) return 0;
    
    let currentStreak = 0;
    let sortedHistory;
    try {
      sortedHistory = [...(checkInHistory || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log('🔍 DASHBOARD - sortedHistory created successfully:', sortedHistory.length, 'items');
    } catch (error) {
      console.error('🔍 DASHBOARD - Error creating sortedHistory:', error);
      return 0;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const checkInDate = new Date(sortedHistory[i].createdAt);
      checkInDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
      
      if (checkInDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const getWeeklyAverage = () => {
    if (!checkInHistory || checkInHistory.length === 0) return 0;
    
    const sum = (checkInHistory || []).reduce((acc, checkin) => acc + (checkin.mood || 0), 0);
    return (sum / (checkInHistory || []).length).toFixed(1);
  };

  const retryLoadData = async () => {
    setError(null);
    // Trigger the useEffect again by updating a dependency
    window.location.reload();
  };

  if (loading) {
    return <LoadingState message="Loading your wellness dashboard..." size="large" />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={retryLoadData}
        title="Failed to Load Dashboard"
        description="We couldn't load your wellness dashboard. Please try again."
        variant="card"
      />
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
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'Friend'}! 👋`}
        subtitle="Welcome to your wellness journey. Let's make today amazing!"
        icon={HomeIcon}
        gradient={true}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Check-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-4"
        >
          {hasCheckedInToday && !canCheckInAgain ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">{getMoodEmoji(todayMood)}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Check-in Complete!</h3>
              <p className="text-gray-600 text-sm mb-4">
                You rated your mood {todayMood}/5 today
              </p>
              <div className="flex items-center justify-center text-green-600 text-sm font-medium mb-4">
                <CoinsIcon size={16} className="mr-1" />
                <span>+75 Happy Coins earned</span>
              </div>
              
              {/* Countdown Timer */}
              {timeUntilNextCheckIn && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <div className="text-xs text-gray-500 mb-2">Next check-in available in:</div>
                  <div className="font-mono text-2xl font-bold text-gray-700 mb-1">
                    {timeUntilNextCheckIn}
                  </div>
                  <div className="text-xs text-gray-400">
                    Hours : Minutes : Seconds
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <HeartIcon size={20} className="text-sage-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Daily Check-in</h3>
              <p className="text-gray-600 text-sm mb-4">
                {canCheckInAgain && hasCheckedInToday 
                  ? "Ready for your next check-in!" 
                  : "Share how you're feeling today"
                }
              </p>
              <Link 
                to="/checkin"
                className="w-full bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <span>Check-in Now</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Active Surveys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-4"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon size={20} className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Pulse Surveys</h3>
            <p className="text-gray-600 text-sm mb-4">
              {(activeSurveys || []).length} surveys available
            </p>
            <Link 
              to="/employee/surveys"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <span>View Surveys</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AwardIcon size={24} className="text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rewards</h3>
            <p className="text-gray-600 text-sm mb-4">
              {happyCoins} Happy Coins
            </p>
            <Link 
              to="/employee/rewards"
              className="btn-outline inline-flex items-center space-x-2"
            >
              <span>Redeem</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Wellness Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Current Streak"
          value={getStreakStats()}
          label="consecutive days"
          icon={TrendingUpIcon}
          trendValue="Keep it up! 🔥"
          trend="up"
          delay={0.5}
        />
        
        <StatCard
          title="Weekly Average"
          value={getWeeklyAverage()}
          label="out of 5.0"
          icon={StarIcon}
          trendValue={getWeeklyAverage() >= 3.5 ? 'Doing great! 📈' : 'Room to improve 📊'}
          trend={getWeeklyAverage() >= 3.5 ? 'up' : 'down'}
          delay={0.6}
        />
        
        <StatCard
          title="Happy Coins"
          value={happyCoins}
          label="total earned"
          icon={CoinsIcon}
          trendValue="+75 daily possible 🪙"
          trend="up"
          delay={0.7}
        />
      </div>

      {/* Recent Activity */}
      {checkInHistory && checkInHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-glass"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Check-ins</h2>
            <Link 
              to="/checkin" 
              className="text-sage-600 hover:text-sage-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRightIcon size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(checkInHistory || []).slice(0, 7).map((checkIn, index) => (
              <motion.div
                key={checkIn._id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                className="text-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="text-2xl mb-2">{getMoodEmoji(checkIn.mood)}</div>
                <div className="text-xs text-gray-600 font-medium">
                  {(() => {
                    const dateStr = checkIn.createdAt || checkIn.date || checkIn.timestamp;
                    if (!dateStr) return 'N/A';
                    
                    try {
                      const date = new Date(dateStr);
                      if (isNaN(date.getTime())) return 'N/A';
                      
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    } catch (error) {
                      console.error('Date parsing error:', error, dateStr);
                      return 'N/A';
                    }
                  })()}
                </div>
                <div className="text-xs text-gray-500">
                  {checkIn.mood}/5
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-glass text-center bg-gradient-to-r from-sage-50 to-sage-100"
      >
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Daily Wellness Tip
        </h3>
        <p className="text-gray-600 italic">
          "Take time to nurture your mental well-being. Small daily steps lead to lasting wellness habits."
        </p>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;