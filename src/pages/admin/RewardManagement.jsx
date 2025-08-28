import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Search as MagnifyingGlassIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Gift as GiftIcon,
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  DollarSign as CurrencyDollarIcon,
  Tag as TagIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Trophy as TrophyIcon
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const RewardManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🏆' },
    { value: 'wellness', label: 'Wellness', icon: '🌟' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
    { value: 'fitness', label: 'Fitness', icon: '🏃' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'merchandise', label: 'Merchandise', icon: '🎁' },
    { value: 'experience', label: 'Experience', icon: '🎪' },
    { value: 'donation', label: 'Donation', icon: '❤️' }
  ];

  const rewardTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'physical', label: 'Physical', icon: '📦' },
    { value: 'digital', label: 'Digital', icon: '💳' },
    { value: 'service', label: 'Service', icon: '🛎️' },
    { value: 'discount', label: 'Discount', icon: '💰' },
    { value: 'voucher', label: 'Voucher', icon: '🎫' }
  ];

  // Template rewards with diverse, appealing options
  const templateRewards = [
    // Wellness & Health
    {
      title: "Premium Wellness Package",
      description: "Comprehensive wellness package including fitness tracker, healthy meal delivery vouchers, and spa day certificate.",
      category: "wellness",
      type: "physical",
      cost: 500,
      value: "$750 wellness package",
      details: [
        "Latest fitness tracker with heart rate monitoring",
        "$200 voucher for healthy meal delivery service",
        "Full day spa treatment certificate",
        "Premium yoga mat and meditation accessories",
        "3-month subscription to meditation app"
      ],
      redemptionInstructions: "Contact HR to schedule spa appointment and arrange delivery of physical items. Meal delivery voucher will be emailed within 24 hours.",
      availableQuantity: 10,
      isActive: true,
      isLimited: true,
      expirationDays: 90,
      isTemplate: true
    },
    {
      title: "Mental Health & Mindfulness Retreat",
      description: "Weekend mindfulness retreat focusing on stress reduction, meditation, and mental wellness techniques.",
      category: "wellness",
      type: "service",
      cost: 800,
      value: "Weekend wellness retreat",
      details: [
        "2-day/1-night retreat at peaceful location",
        "Guided meditation and mindfulness sessions",
        "Stress management workshops",
        "Healthy meals and accommodation included",
        "Take-home wellness toolkit"
      ],
      redemptionInstructions: "HR will coordinate with retreat center to schedule your experience. Advanced booking required due to limited availability.",
      availableQuantity: 5,
      isActive: true,
      isLimited: true,
      expirationDays: 180,
      isTemplate: true
    },

    // Professional Development
    {
      title: "Professional Conference & Networking Pass",
      description: "Full access to industry conference of your choice, including networking events and professional development workshops.",
      category: "education",
      type: "service",
      cost: 600,
      value: "Conference registration + travel allowance",
      details: [
        "Full conference registration to approved event",
        "$500 travel and accommodation allowance",
        "Networking dinner tickets included",
        "Access to recorded sessions for 1 year",
        "Professional development certificate"
      ],
      redemptionInstructions: "Choose from pre-approved conference list or submit proposal for approval. Book at least 8 weeks in advance.",
      availableQuantity: 8,
      isActive: true,
      isLimited: true,
      expirationDays: 365,
      isTemplate: true
    },
    {
      title: "Leadership Coaching Sessions",
      description: "One-on-one leadership coaching with certified executive coach to accelerate your professional growth.",
      category: "education",
      type: "service",
      cost: 400,
      value: "4 hours of executive coaching",
      details: [
        "4 one-hour sessions with certified executive coach",
        "Personalized leadership assessment",
        "Custom development action plan",
        "360-degree feedback analysis",
        "Follow-up progress check-in after 3 months"
      ],
      redemptionInstructions: "HR will connect you with approved coaching partners. Sessions can be scheduled flexibly over 3-month period.",
      availableQuantity: 12,
      isActive: true,
      isLimited: false,
      expirationDays: 120,
      isTemplate: true
    },

    // Recognition & Awards
    {
      title: "Employee of the Month VIP Package",
      description: "Premium recognition package celebrating exceptional performance and contribution to team success.",
      category: "merchandise",
      type: "physical",
      cost: 300,
      value: "Recognition package + perks",
      details: [
        "Personalized crystal achievement award",
        "Prime parking spot for one month",
        "$100 dining voucher for local restaurants",
        "Professional headshot session",
        "Feature in company newsletter and social media",
        "Choice of premium company merchandise"
      ],
      redemptionInstructions: "Award ceremony will be scheduled with leadership team. Photography session and parking spot assignment handled by facilities.",
      availableQuantity: 1,
      isActive: true,
      isLimited: true,
      expirationDays: 30,
      isTemplate: true
    },
    {
      title: "Innovation Champion Badge",
      description: "Special recognition for employees who drive innovation and creative problem-solving in their teams.",
      category: "merchandise",
      type: "digital",
      cost: 150,
      value: "Innovation recognition + rewards",
      details: [
        "Digital innovation badge for professional profiles",
        "Physical innovation trophy for desk/office",
        "$50 creative project fund for next initiative",
        "Priority consideration for innovation committees",
        "Lunch with senior leadership team"
      ],
      redemptionInstructions: "Badge will be added to your digital profiles within 48 hours. Leadership lunch scheduled within 2 weeks.",
      availableQuantity: 20,
      isActive: true,
      isLimited: false,
      expirationDays: 60,
      isTemplate: true
    },

    // Experiences
    {
      title: "Adventure Experience Voucher",
      description: "Choose your own adventure from curated list of exciting experiences designed to create lasting memories.",
      category: "experiences",
      type: "voucher",
      cost: 350,
      value: "$500 experience voucher",
      details: [
        "Hot air balloon ride for two",
        "Wine tasting and vineyard tour",
        "Cooking class with professional chef",
        "Weekend camping gear and site reservation",
        "Art workshop or pottery class",
        "Live music or theater performance tickets",
        "Outdoor adventure activity (rock climbing, kayaking, etc.)"
      ],
      redemptionInstructions: "Choose from experience menu and book through our partner platform. Most experiences available within 30 days notice.",
      availableQuantity: 15,
      isActive: true,
      isLimited: false,
      expirationDays: 365,
      isTemplate: true
    },
    {
      title: "Cultural Enrichment Package",
      description: "Expand your horizons with access to cultural events, museums, and educational experiences.",
      category: "experiences",
      type: "voucher",
      cost: 200,
      value: "Cultural experience pass",
      details: [
        "Museum and art gallery annual pass",
        "Two tickets to local theater productions",
        "Language learning app premium subscription (1 year)",
        "Documentary film festival pass",
        "Book club membership with monthly selections",
        "Access to online cultural courses"
      ],
      redemptionInstructions: "Passes and subscriptions will be activated within 1 week. Theater tickets subject to availability.",
      availableQuantity: 25,
      isActive: true,
      isLimited: false,
      expirationDays: 180,
      isTemplate: true
    },

    // Technology & Gadgets
    {
      title: "Home Office Tech Upgrade",
      description: "Enhance your productivity with premium technology tools for your home office setup.",
      category: "tech",
      type: "physical",
      cost: 450,
      value: "Premium tech package",
      details: [
        "Wireless noise-canceling headphones",
        "Ergonomic wireless keyboard and mouse set",
        "4K webcam for video conferencing",
        "Portable monitor for dual-screen setup",
        "Premium laptop stand and organizer",
        "Smart home assistant device"
      ],
      redemptionInstructions: "Items will be ordered and shipped to your preferred address within 5-7 business days.",
      availableQuantity: 12,
      isActive: true,
      isLimited: true,
      expirationDays: 30,
      isTemplate: true
    },

    // Food & Dining
    {
      title: "Culinary Adventure Pass",
      description: "Explore diverse dining experiences and culinary workshops to expand your gastronomic horizons.",
      category: "food",
      type: "voucher",
      cost: 250,
      value: "$400 dining credit",
      details: [
        "$300 credit at participating local restaurants",
        "Cooking class with professional chef",
        "Wine or beer tasting experience",
        "Artisanal food and spice sampling box",
        "Cookbook collection (3 premium titles)",
        "Access to exclusive food events"
      ],
      redemptionInstructions: "Restaurant credits loaded to digital card within 24 hours. Cooking classes can be booked through partner website.",
      availableQuantity: 20,
      isActive: true,
      isLimited: false,
      expirationDays: 120,
      isTemplate: true
    },

    // Time Off & Flexibility
    {
      title: "Ultimate Flexibility Package",
      description: "Extra time off and flexible work arrangements to support better work-life balance.",
      category: "time-off",
      type: "time-off",
      cost: 400,
      value: "Flexible work benefits",
      details: [
        "2 additional vacation days (use within year)",
        "4 work-from-anywhere days",
        "Flexible hours for 1 month",
        "Late start Friday (10 AM) for 8 weeks",
        "Priority scheduling for time-off requests",
        "Extended lunch breaks (90 minutes) for 2 weeks"
      ],
      redemptionInstructions: "Coordinate with your manager to plan flexible arrangements. Additional vacation days added to your balance immediately.",
      availableQuantity: 30,
      isActive: true,
      isLimited: false,
      expirationDays: 90,
      isTemplate: true
    },

    // Charitable Giving
    {
      title: "Make a Difference Donation",
      description: "Company will make a charitable donation to the cause of your choice, amplifying your impact.",
      category: "charitable",
      type: "donation",
      cost: 200,
      value: "$500 charitable donation",
      details: [
        "$500 donation to charity of your choice",
        "Donation certificate with your name",
        "Company will match your personal donation up to $100",
        "Volunteer time off day to support chosen cause",
        "Feature your chosen charity in company communications",
        "Connect with other employees supporting similar causes"
      ],
      redemptionInstructions: "Choose from pre-approved charity list or submit new charity for approval. Donation made within 2 weeks.",
      availableQuantity: 50,
      isActive: true,
      isLimited: false,
      expirationDays: 60,
      isTemplate: true
    }
  ];

  useEffect(() => {
    loadRewards();
  }, []);

  useEffect(() => {
    filterRewards();
  }, [rewards, searchQuery, selectedCategory, selectedType]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await api.getRewards();
      if (response.success) {
        setRewards(response.data.rewards || []);
      }
    } catch (err) {
      console.error('Failed to load rewards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRewards = () => {
    let filtered = rewards;

    if (searchQuery.trim()) {
      filtered = filtered.filter(reward =>
        reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(reward => reward.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(reward => reward.type === selectedType);
    }

    setFilteredRewards(filtered);
  };

  const handleCreateReward = async (rewardData) => {
    try {
      const response = await api.createReward(rewardData);
      if (response.success) {
        setRewards(prev => [response.data.reward, ...prev]);
        setShowModal(false);
        toast.success('Reward created successfully!');
      }
    } catch (error) {
      console.error('Failed to create reward:', error);
      toast.error('Failed to create reward');
    }
  };

  const handleUpdateReward = async (rewardId, rewardData) => {
    try {
      const response = await api.updateReward(rewardId, rewardData);
      if (response.success) {
        setRewards(prev => prev.map(reward => 
          reward._id === rewardId ? response.data.reward : reward
        ));
        setEditingReward(null);
        setShowModal(false);
        toast.success('Reward updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update reward:', error);
      toast.error('Failed to update reward');
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await api.deleteReward(rewardId);
      if (response.success) {
        setRewards(prev => prev.filter(reward => reward._id !== rewardId));
        toast.success('Reward deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleToggleStatus = async (rewardId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await api.updateReward(rewardId, { 
        availability: { isActive: newStatus } 
      });
      if (response.success) {
        setRewards(prev => prev.map(reward => 
          reward._id === rewardId ? { 
            ...reward, 
            availability: { ...reward.availability, isActive: newStatus } 
          } : reward
        ));
        toast.success(`Reward ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update reward status');
    }
  };

  const handleUseTemplate = (template) => {
    // Remove any ID fields from template to ensure it's treated as a new item
    const { _id, id, ...templateData } = template;
    setEditingReward(templateData);
    setShowModal(true);
    setShowTemplates(false);
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || { label: category, icon: '🏆' };
  };

  const getTypeInfo = (type) => {
    return rewardTypes.find(t => t.value === type) || { label: type, icon: '🎁' };
  };

  if (loading) {
    return <LoadingState message="Loading rewards..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load rewards"
        description={error}
        onRetry={loadRewards}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Management"
        subtitle="Create and manage rewards to motivate and recognize employee achievements"
        icon={GiftIcon}
        iconColor="text-yellow-600"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        {/* Search and Filters */}
        <div className="flex flex-1 space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            {rewardTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <StarIcon className="h-5 w-5" />
            <span>Templates</span>
          </button>
          
          <button
            onClick={() => {
              setEditingReward(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Reward</span>
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRewards.map((reward) => {
            const categoryInfo = getCategoryInfo(reward.category);
            const typeInfo = getTypeInfo(reward.type);
            
            return (
              <motion.div
                key={reward._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                  reward.availability?.isActive ? 'border-yellow-200' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      reward.availability?.isActive ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">{categoryInfo.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reward.availability?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {reward.availability?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {reward.availability?.quantity !== -1 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                          Limited ({reward.availability?.quantity || 0} left)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleStatus(reward._id, reward.availability?.isActive)}
                      className={`p-1 rounded transition-colors ${
                        reward.availability?.isActive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={reward.availability?.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {reward.availability?.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingReward(reward);
                        setShowModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {reward.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {reward.description}
                </p>

                {/* Value and Cost */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm">
                      <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">{reward.cost} coins</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <GiftIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">{reward.value}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-4 w-4" />
                      <span>{reward.redemptions?.length || 0} redeemed</span>
                    </div>
                  </div>
                </div>

                {/* Expiration Info */}
                {reward.expirationDays && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>Expires in {reward.expirationDays} days after redemption</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {reward.createdAt ? 
                      new Date(reward.createdAt).toLocaleDateString() : 
                      'Just created'
                    }
                  </span>
                  <span className={`px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                    {categoryInfo.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <GiftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all' ? 
              'No rewards found' : 'No rewards yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first reward to motivate and recognize your team'
            }
          </p>
          {(!searchQuery && selectedCategory === 'all' && selectedType === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Create First Reward
            </button>
          )}
        </motion.div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templateRewards}
        onUseTemplate={handleUseTemplate}
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingReward(null);
        }}
        reward={editingReward}
        categories={categories.filter(c => c.value !== 'all')}
        rewardTypes={rewardTypes.filter(t => t.value !== 'all')}
        onSubmit={editingReward?._id ? 
          (data) => handleUpdateReward(editingReward._id, data) : 
          handleCreateReward
        }
      />
    </div>
  );
};

// Templates Modal Component
const TemplatesModal = ({ isOpen, onClose, templates, onUseTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reward Templates</h2>
              <p className="text-gray-600 text-sm mt-1">Choose from premium reward templates designed to motivate and engage employees</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-yellow-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      {template.category.replace('-', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {template.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-yellow-600">{template.cost} coins</div>
                    <div className="text-xs text-gray-500">{template.value}</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>
                
                {/* Preview details */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Includes:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.details.slice(0, 3).map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-yellow-500 mr-1">•</span>
                        <span className="line-clamp-1">{detail}</span>
                      </li>
                    ))}
                    {template.details.length > 3 && (
                      <li className="text-xs text-gray-400">+{template.details.length - 3} more benefits</li>
                    )}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {template.isLimited && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Limited</span>}
                    {template.expirationDays && <span>{template.expirationDays} day expiry</span>}
                  </div>
                  
                  <button
                    onClick={() => onUseTemplate(template)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Reward Modal Component
const RewardModal = ({ isOpen, onClose, reward, categories, rewardTypes, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'wellness',
    type: 'digital',
    cost: 100,
    value: 10,
    details: [''],
    redemptionInstructions: '',
    availableQuantity: 0,
    isLimited: false,
    isActive: true,
    expirationDays: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reward) {
      setFormData({
        title: reward.name || '',
        description: reward.description || '',
        category: reward.category || 'wellness',
        type: reward.type || 'digital',
        cost: reward.cost || 100,
        value: reward.value || 10,
        details: reward.details || [''],
        redemptionInstructions: reward.redemptionInstructions || '',
        availableQuantity: reward.availability?.quantity || 0,
        isLimited: reward.availability?.quantity !== -1,
        isActive: reward.availability?.isActive !== undefined ? reward.availability.isActive : true,
        expirationDays: reward.expirationDays || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'wellness',
        type: 'digital',
        cost: 100,
        value: 10,
        details: [''],
        redemptionInstructions: '',
        availableQuantity: 0,
        isLimited: false,
        isActive: true,
        expirationDays: 0
      });
    }
  }, [reward]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.value || parseFloat(formData.value) <= 0) return;

    setSubmitting(true);
    try {
      const submitData = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        cost: parseInt(formData.cost),
        value: parseFloat(formData.value) || 10,
        details: formData.details.filter(detail => detail.trim()),
        redemptionInstructions: formData.redemptionInstructions,
        availability: {
          quantity: formData.isLimited ? parseInt(formData.availableQuantity) : -1,
          isActive: formData.isActive
        },
        redemptionDetails: {
          expiryDays: formData.expirationDays > 0 ? parseInt(formData.expirationDays) : null
        }
      };
      
      await onSubmit(submitData);
      
      // Reset form if creating new reward
      if (!reward) {
        setFormData({
          title: '',
          description: '',
          category: 'wellness',
          type: 'digital',
          cost: 100,
          value: 10,
          details: [''],
          redemptionInstructions: '',
          availableQuantity: 0,
          isLimited: false,
          isActive: true,
          expirationDays: 0
        });
      }
    } catch (error) {
      console.error('Failed to submit reward:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, '']
    }));
  };

  const updateDetail = (index, value) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map((item, i) => i === index ? value : item)
    }));
  };

  const removeDetail = (index) => {
    if (formData.details.length > 1) {
      setFormData(prev => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {reward ? 'Edit Reward' : 'Create New Reward'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Premium Wellness Package"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              >
                {rewardTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost (Happy Coins) *
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value Description *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., $500 wellness package"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this reward and what makes it appealing to employees..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                What's Included
              </label>
              <button
                type="button"
                onClick={addDetail}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                + Add Item
              </button>
            </div>
            {formData.details.map((detail, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => updateDetail(index, e.target.value)}
                  placeholder="e.g., Premium fitness tracker with heart rate monitoring"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                />
                {formData.details.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Redemption Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redemption Instructions
            </label>
            <textarea
              value={formData.redemptionInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, redemptionInstructions: e.target.value }))}
              placeholder="Explain how employees can redeem this reward..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Days (0 = never expires)
              </label>
              <input
                type="number"
                value={formData.expirationDays}
                onChange={(e) => setFormData(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 0 }))}
                min="0"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="isLimited"
                  checked={formData.isLimited}
                  onChange={(e) => setFormData(prev => ({ ...prev, isLimited: e.target.checked }))}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="isLimited" className="ml-2 block text-sm text-gray-900">
                  Limited quantity
                </label>
              </div>
              
              {formData.isLimited && (
                <input
                  type="number"
                  value={formData.availableQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableQuantity: parseInt(e.target.value) || 0 }))}
                  placeholder="Available quantity"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible to employees)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (reward ? 'Update Reward' : 'Create Reward')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RewardManagement;