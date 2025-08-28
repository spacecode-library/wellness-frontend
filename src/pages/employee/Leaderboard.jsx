import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrophyIcon,
  CrownIcon,
  CoinsIcon,
  StarIcon,
  UsersIcon,
  TrendingUpIcon,
  MedalIcon,
  AwardIcon,
  RefreshCwIcon,
  FilterIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import StatCard from '../../components/shared/StatCard';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({});

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedDepartment]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load global or department-specific leaderboard
      let leaderboardResponse;
      if (selectedDepartment === 'all') {
        leaderboardResponse = await api.getHappyCoinsLeaderboard({ limit: 50 });
      } else {
        leaderboardResponse = await api.getDepartmentLeaderboard(selectedDepartment);
      }

      if (leaderboardResponse.success) {
        setLeaderboard(leaderboardResponse.data.leaderboard || []);
        setCurrentUser(leaderboardResponse.data.currentUser);
        setPagination(leaderboardResponse.data.pagination || {});
      }

      // Load stats only for global view
      if (selectedDepartment === 'all') {
        try {
          const statsResponse = await api.getLeaderboardStats();
          if (statsResponse.success) {
            setStats(statsResponse.data);
            // Extract departments for filter
            const depts = statsResponse.data.byDepartment?.map(dept => dept._id).filter(Boolean) || [];
            setDepartments(depts);
          }
        } catch (statsError) {
          console.warn('Failed to load stats:', statsError);
        }
      }

    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
    toast.success('Leaderboard refreshed!');
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <CrownIcon className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <MedalIcon className="h-6 w-6 text-gray-400" />;
      case 3:
        return <AwardIcon className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      default:
        return 'bg-white border border-sage-200';
    }
  };

  const formatCoins = (coins) => {
    if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}k`;
    }
    return coins.toString();
  };

  if (loading) {
    return <LoadingState message="Loading leaderboard..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load leaderboard"
        description={error}
        onRetry={loadLeaderboardData}
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
      <PageHeader
        title="Happy Coins Leaderboard"
        subtitle="See how you rank among your colleagues in wellness engagement"
        icon={TrophyIcon}
        gradient={true}
      />

      {/* Stats Overview */}
      {stats && selectedDepartment === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Active Employees"
            value={stats.overall.totalEmployees}
            label="employees"
            icon={UsersIcon}
            delay={0.1}
          />
          
          <StatCard
            title="Total Happy Coins"
            value={formatCoins(stats.overall.totalHappyCoins || 0)}
            label="coins earned"
            icon={CoinsIcon}
            delay={0.2}
          />
          
          <StatCard
            title="Average Coins"
            value={Math.round(stats.overall.averageHappyCoins || 0)}
            label="per employee"
            icon={TrendingUpIcon}
            delay={0.3}
          />
          
          <StatCard
            title="Top Score"
            value={formatCoins(stats.overall.maxHappyCoins || 0)}
            label="highest coins"
            icon={StarIcon}
            delay={0.4}
          />
        </div>
      )}

      {/* Filters and Controls */}
      <div className="card-glass">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FilterIcon size={20} className="text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-primary min-w-[200px]"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={refreshLeaderboard}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCwIcon 
              size={16} 
              className={refreshing ? 'animate-spin' : ''} 
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Current User Position */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass border-2 border-sage-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-sage-100 rounded-full">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={24} className="text-sage-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Position</h3>
                <p className="text-sm text-gray-600">{currentUser.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-sage-600">
                  #{currentUser.rank || currentUser.globalRank}
                </div>
                <div className="text-xs text-gray-500">Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 flex items-center">
                  <CoinsIcon size={20} className="mr-1" />
                  {formatCoins(currentUser.happyCoins || 0)}
                </div>
                <div className="text-xs text-gray-500">Happy Coins</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <div className="card-glass">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {selectedDepartment === 'all' ? 'Global' : selectedDepartment} Rankings
        </h2>
        
        <div className="space-y-4">
          <AnimatePresence>
            {leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl transition-all duration-200 hover:shadow-md ${getRankBgColor(user.rank)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(user.rank)}
                      </div>
                      
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <UserIcon size={24} className="text-gray-500" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`font-semibold ${user.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </h3>
                        <p className={`text-sm ${user.rank <= 3 ? 'text-white/80' : 'text-gray-600'}`}>
                          {user.department || 'No Department'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                        user.rank <= 3 
                          ? 'bg-white/20 text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <CoinsIcon size={16} />
                        <span className="font-bold">
                          {formatCoins(user.happyCoins || 0)}
                        </span>
                      </div>
                      
                      {user.rank <= 3 && (
                        <div className="flex items-center">
                          {user.rank === 1 && <span className="text-xl">🥇</span>}
                          {user.rank === 2 && <span className="text-xl">🥈</span>}
                          {user.rank === 3 && <span className="text-xl">🥉</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <TrophyIcon size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Rankings Available
                </h3>
                <p className="text-gray-500">
                  Start earning Happy Coins to appear on the leaderboard!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="text-sm text-gray-500">
              Showing {leaderboard.length} of {pagination.totalUsers} users
            </div>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-glass text-center bg-gradient-to-r from-sage-50 to-sage-100"
      >
        <div className="text-4xl mb-4">🌟</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Keep Going!
        </h3>
        <p className="text-gray-600">
          Earn Happy Coins by checking in daily, completing surveys, joining challenges, and engaging with wellness resources.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default Leaderboard;