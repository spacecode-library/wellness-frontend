import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CoinsIcon, 
  GiftIcon, 
  ShoppingCartIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  CreditCardIcon,
  CalendarIcon,
  BarChart3Icon,
  EyeIcon,
  ArrowRightIcon,
  XIcon,
  DollarSignIcon
} from 'lucide-react';
import useWellnessStore from '../../store/wellnessStore';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import EmptyState from '../../components/shared/EmptyState';
import TabNavigation from '../../components/shared/TabNavigation';

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, redeemed
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRewardDetails, setShowRewardDetails] = useState(false);

  const { getRewards, redeemReward, getUserAchievements } = useWellnessStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const userCoins = user?.wellness?.happyCoins || 0;

  useEffect(() => {
    const loadRewardsData = async () => {
      try {
        setLoading(true);
        
        // Load rewards
        try {
          const rewardsResponse = await getRewards();
          console.log('🔍 REWARDS - Raw response:', rewardsResponse);
          
          // Handle different response formats
          let rewardsArray = [];
          if (Array.isArray(rewardsResponse)) {
            rewardsArray = rewardsResponse;
          } else if (rewardsResponse?.rewards && Array.isArray(rewardsResponse.rewards)) {
            rewardsArray = rewardsResponse.rewards;
          } else if (rewardsResponse?.data?.rewards && Array.isArray(rewardsResponse.data.rewards)) {
            rewardsArray = rewardsResponse.data.rewards;
          } else if (rewardsResponse?.data && Array.isArray(rewardsResponse.data)) {
            rewardsArray = rewardsResponse.data;
          }
          
          setRewards(rewardsArray);
        } catch (err) {
          console.warn('Failed to load rewards:', err);
          setRewards([]);
        }
        
        // Load achievements
        try {
          const achievementsResponse = await getUserAchievements();
          console.log('🔍 ACHIEVEMENTS - Raw response:', achievementsResponse);
          
          // Handle different response formats
          let achievementsArray = [];
          if (Array.isArray(achievementsResponse)) {
            achievementsArray = achievementsResponse;
          } else if (achievementsResponse?.achievements && Array.isArray(achievementsResponse.achievements)) {
            achievementsArray = achievementsResponse.achievements;
          } else if (achievementsResponse?.data && Array.isArray(achievementsResponse.data)) {
            achievementsArray = achievementsResponse.data;
          }
          
          // Filter achievements to show only reward-related ones
          const rewardRedemptions = achievementsArray.filter(a => a.type === 'reward_redemption') || [];
          setUserRedemptions(rewardRedemptions);
        } catch (err) {
          console.warn('Failed to load achievements:', err);
          setUserRedemptions([]);
        }
        
      } catch (error) {
        console.error('Error loading rewards data:', error);
        setRewards([]);
        setUserRedemptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadRewardsData();
  }, [getRewards, getUserAchievements]);

  const handleRedeem = async (reward) => {
    const rewardCost = reward.cost || reward.coins_required || 0;
    const rewardId = reward._id || reward.id;
    
    if (userCoins < rewardCost || redeeming) return;

    setRedeeming(rewardId);
    try {
      // Call redeemReward with fulfillment method
      await redeemReward(rewardId, 1, 'email'); // Default to email fulfillment
      
      // Update local state
      setUserRedemptions(prev => [...prev, {
        reward_name: reward.name,
        coins_spent: rewardCost,
        redeemed_at: new Date().toISOString(),
        reward_id: rewardId
      }]);

      toast.success(`Successfully redeemed ${reward.name}! Check your email for details.`, 'Reward Redeemed');
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward. Please try again.', 'Redemption Error');
    } finally {
      setRedeeming(null);
    }
  };

  const getFilteredRewards = () => {
    const rewardsArray = Array.isArray(rewards) ? rewards : [];
    const redemptionsArray = Array.isArray(userRedemptions) ? userRedemptions : [];
    
    if (filter === 'available') {
      return rewardsArray.filter(r => (r.cost || r.coins_required || 0) <= userCoins);
    }
    if (filter === 'redeemed') {
      const redeemedIds = redemptionsArray.map(ur => ur.reward_id);
      return rewardsArray.filter(r => redeemedIds.includes(r._id || r.id));
    }
    return rewardsArray;
  };

  const hasRedeemed = (rewardId) => {
    return userRedemptions.some(ur => ur.reward_id === rewardId);
  };

  const handleViewDetails = (reward) => {
    setSelectedReward(reward);
    setShowRewardDetails(true);
  };

  const handleBackToRewards = () => {
    setShowRewardDetails(false);
    setSelectedReward(null);
  };

  if (loading) {
    return <LoadingState message="Loading rewards marketplace..." size="large" />;
  }

  // If showing reward details, render the details view
  if (showRewardDetails && selectedReward) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToRewards}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowRightIcon size={16} className="rotate-180" />
            <span>Back to Rewards</span>
          </button>
        </div>

        {/* Reward Details */}
        <div className="card-glass">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedReward.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-sage-100 text-sage-700 px-3 py-1 rounded-full">
                  {selectedReward.category}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {selectedReward.type}
                </span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="mb-6">
            {(selectedReward.images && selectedReward.images.length > 0) ? (
              <img 
                src={selectedReward.images[0]} 
                alt={selectedReward.name}
                className="w-full h-64 object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center">
                <GiftIcon size={64} className="text-sage-600" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {selectedReward.description}
              </p>
            </div>

            {/* Cost and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-1">
                  <CoinsIcon size={20} className="text-yellow-500" />
                  <span className="font-medium text-gray-900">Cost</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedReward.cost || selectedReward.coins_required || 0} Happy Coins
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-1">
                  <StarIcon size={20} className="text-green-500" />
                  <span className="font-medium text-gray-900">Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedReward.value || 0}
                </p>
              </div>
            </div>

            {/* Merchant Info */}
            {selectedReward.merchant?.name && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Merchant</h3>
                <p className="text-gray-600">{selectedReward.merchant.name}</p>
                {selectedReward.merchant.website && (
                  <a
                    href={selectedReward.merchant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage-600 hover:text-sage-700 text-sm mt-1 inline-flex items-center space-x-1"
                  >
                    <span>Visit website</span>
                    <ArrowRightIcon size={14} />
                  </a>
                )}
              </div>
            )}

            {/* Redemption Instructions */}
            {selectedReward.redemptionDetails?.instructions && (
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">How to Redeem</h3>
                <p className="text-gray-600 text-sm">
                  {selectedReward.redemptionDetails.instructions}
                </p>
              </div>
            )}

            {/* Availability Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {selectedReward.availability?.endDate && (
                <div className="flex items-center space-x-1">
                  <ClockIcon size={16} />
                  <span>
                    Expires {new Date(selectedReward.availability.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {(selectedReward.availability?.quantity > 0 && selectedReward.availability?.quantity !== -1) && (
                <div className="flex items-center space-x-1">
                  <StarIcon size={16} />
                  <span>Limited quantity available</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t">
              {hasRedeemed(selectedReward._id || selectedReward.id) ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 font-medium py-4 px-6 rounded-xl border border-gray-200 cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200"
                >
                  <CheckCircleIcon size={18} className="flex-shrink-0 text-green-500" />
                  <span>Already Redeemed</span>
                </button>
              ) : userCoins < (selectedReward.cost || selectedReward.coins_required || 0) ? (
                <button
                  disabled
                  className="w-full bg-red-50 text-red-600 font-medium py-4 px-6 rounded-xl border border-red-200 cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200"
                >
                  <CoinsIcon size={18} className="flex-shrink-0" />
                  <span>Need {((selectedReward.cost || selectedReward.coins_required || 0) - userCoins).toLocaleString()} more coins</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleRedeem(selectedReward);
                  }}
                  disabled={redeeming === (selectedReward._id || selectedReward.id)}
                  className={`w-full bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 ${
                    redeeming === (selectedReward._id || selectedReward.id) ? 'opacity-70 cursor-not-allowed transform-none hover:transform-none' : ''
                  }`}
                >
                  {redeeming === (selectedReward._id || selectedReward.id) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <span>Redeeming...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon size={18} className="flex-shrink-0" />
                      <span>Redeem for {selectedReward.cost || selectedReward.coins_required || 0} Happy Coins</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="Rewards Marketplace"
        subtitle="Redeem your Happy Coins for exciting rewards and wellness perks"
        icon={GiftIcon}
      />

      {/* Coins Balance */}
      <div className="card-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <CoinsIcon size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userCoins.toLocaleString()} Happy Coins
              </h2>
              <p className="text-gray-600">Available balance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Daily earnings</div>
            <div className="flex items-center space-x-1 text-green-600 font-medium">
              <span>+50</span>
              <CoinsIcon size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <TabNavigation
        tabs={[
          { id: 'all', label: 'All Rewards', icon: GiftIcon },
          { id: 'available', label: 'Available', icon: ShoppingCartIcon },
          { id: 'redeemed', label: 'Redeemed', icon: CheckCircleIcon }
        ]}
        activeTab={filter}
        onTabChange={setFilter}
      />

      {/* Rewards Grid */}
      {getFilteredRewards().length === 0 ? (
        <div className="card-glass text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === 'available' 
              ? 'No Rewards Available' 
              : filter === 'redeemed' 
                ? 'No Rewards Redeemed Yet'
                : 'No Rewards Found'
            }
          </h3>
          <p className="text-gray-600">
            {filter === 'available' 
              ? 'Keep earning Happy Coins to unlock more rewards!'
              : filter === 'redeemed'
                ? 'Start redeeming rewards to build your collection.'
                : 'Check back later for new rewards!'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredRewards().map((reward, index) => {
            const rewardCost = reward.cost || reward.coins_required || 0;
            const rewardId = reward._id || reward.id;
            
            return (
            <motion.div
              key={rewardId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-glass hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col h-full"
              onClick={() => handleViewDetails(reward)}
            >
              {/* Reward Image/Icon */}
              <div className="relative mb-4">
                {(reward.images && reward.images.length > 0) ? (
                  <img 
                    src={reward.images[0]} 
                    alt={reward.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-sage-100 to-sage-200 rounded-xl flex items-center justify-center">
                    <GiftIcon size={48} className="text-sage-600" />
                  </div>
                )}
                
                {/* Coins Badge */}
                <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <CoinsIcon size={16} className="text-yellow-500" />
                  <span className="font-bold text-gray-900">{rewardCost}</span>
                </div>

                {/* View Details Icon */}
                <div className="absolute top-3 left-3 bg-sage-100 bg-opacity-90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <EyeIcon size={16} className="text-sage-600" />
                </div>

                {/* Status Badge */}
                {hasRedeemed(rewardId) && (
                  <div className="absolute bottom-3 left-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Redeemed
                  </div>
                )}
              </div>

              {/* Reward Details */}
              <div className="space-y-4 flex-grow flex flex-col">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {reward.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {reward.description}
                  </p>
                </div>

                {/* Reward Meta */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {reward.category && (
                      <span className="text-gray-500">
                        {reward.category}
                      </span>
                    )}
                    {reward.availability?.endDate && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <ClockIcon size={14} />
                        <span>
                          Expires {new Date(reward.availability.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {(reward.availability?.quantity > 0 && reward.availability?.quantity !== -1) && (
                    <div className="flex items-center space-x-1 text-purple-600">
                      <StarIcon size={14} />
                      <span className="text-xs font-medium">Limited</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4 mt-auto">
                  {hasRedeemed(rewardId) ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 font-medium py-3 px-4 rounded-xl border border-gray-200 cursor-not-allowed flex items-center justify-center space-x-2 text-sm transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CheckCircleIcon size={16} className="flex-shrink-0 text-green-500" />
                      <span>Already Redeemed</span>
                    </button>
                  ) : userCoins < rewardCost ? (
                    <button
                      disabled
                      className="w-full bg-red-50 text-red-600 font-medium py-3 px-4 rounded-xl border border-red-200 cursor-not-allowed flex items-center justify-center space-x-2 text-sm transition-all duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CoinsIcon size={16} className="flex-shrink-0" />
                      <span className="text-center leading-tight">
                        Need {(rewardCost - userCoins).toLocaleString()}<br />
                        <span className="text-xs opacity-75">more coins</span>
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRedeem(reward);
                      }}
                      disabled={redeeming === rewardId}
                      className={`w-full bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                        redeeming === rewardId ? 'opacity-70 cursor-not-allowed transform-none hover:transform-none' : ''
                      }`}
                    >
                      {redeeming === rewardId ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                          <span>Redeeming...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon size={16} className="flex-shrink-0" />
                          <span className="text-center leading-tight">
                            Redeem for {rewardCost}<br />
                            <span className="text-xs opacity-90">Happy Coins</span>
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Redemptions */}
      {userRedemptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrophyIcon size={24} className="text-sage-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Redemptions
            </h2>
          </div>
          
          <div className="space-y-3">
            {userRedemptions.slice(0, 5).map((redemption, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                    <GiftIcon size={18} className="text-sage-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {redemption.reward_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <CoinsIcon size={16} />
                  <span className="font-medium">-{redemption.coins_spent}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Earning Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-glass bg-gradient-to-r from-sage-50 to-sage-100"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CoinsIcon size={32} className="text-sage-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How to Earn More Happy Coins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon size={24} className="text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Daily Check-ins</p>
              <p className="text-gray-600 text-sm">Earn 75 coins every day</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3Icon size={24} className="text-green-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Complete Surveys</p>
              <p className="text-gray-600 text-sm">Up to 100 coins per survey</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrophyIcon size={24} className="text-yellow-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Achievements</p>
              <p className="text-gray-600 text-sm">Bonus coins for milestones</p>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}

export default Rewards;