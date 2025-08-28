import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  BuildingIcon,
  CalendarIcon,
  EditIcon,
  SaveIcon,
  CameraIcon,
  BellIcon,
  ShieldIcon,
  KeyIcon,
  LogOutIcon,
  TrophyIcon,
  CoinsIcon,
  SettingsIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useWellnessStore from '../../store/wellnessStore';
import PageHeader from '../../components/shared/PageHeader';
import TabNavigation from '../../components/shared/TabNavigation';
import SlackIntegrationCard from '../../components/integration/SlackIntegrationCard';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [wellnessStats, setWellnessStats] = useState(null);

  const { user, updateProfile, logout, refreshProfile } = useAuthStore();
  const { toast } = useToast();
  const { getUserAchievements, achievements, loadingStates } = useWellnessStore();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        role: user.role || '',
        joinDate: user.created_at || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const loadWellnessStats = async () => {
      try {
        const response = await api.getWellnessStats();
        if (response.success) {
          setWellnessStats(response.data);
        }
      } catch (error) {
        console.warn('Failed to load wellness stats:', error);
      }
    };

    if (user) {
      loadWellnessStats();
    }
  }, [user]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        await getUserAchievements();
      } catch (error) {
        console.warn('Failed to load achievements:', error);
      }
    };

    if (user) {
      loadAchievements();
    }
  }, [user, getUserAchievements]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only send allowed fields: name, phone, department
      const allowedData = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department
      };
      
      await updateProfile(allowedData);
      setIsEditing(false);
      toast.success('Profile updated successfully!', 'Success');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.', 'Update Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your account information and preferences"
        icon={UserIcon}
      />

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-glass"
      >
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-sage-200 to-sage-300 rounded-2xl flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              ) : (
                <UserIcon size={48} className="text-sage-600" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center text-white hover:bg-sage-600 transition-colors">
              <CameraIcon size={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.name || 'User Name'}
            </h2>
            <p className="text-gray-600 mb-4">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.department}
            </p>
            
            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-6">
              <div className="text-center">
                <div className="text-xl font-bold text-sage-600">
                  {wellnessStats?.overview?.totalHappyCoins || user?.wellness?.happyCoins || 0}
                </div>
                <div className="text-xs text-gray-600">Happy Coins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-sage-600">
                  {wellnessStats?.overview?.currentStreak || user?.wellness?.currentStreak || 0}
                </div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-sage-600">
                  {wellnessStats?.milestones?.totalCheckIns || user?.wellness?.totalCheckIns || 0}
                </div>
                <div className="text-xs text-gray-600">Check-ins</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary flex items-center space-x-2"
            >
              <EditIcon size={18} />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-outline flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <LogOutIcon size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h3>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`btn-primary flex items-center space-x-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <SaveIcon size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-primary"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <UserIcon size={20} className="text-gray-500" />
                      <span className="text-gray-900">{formData.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-primary"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <MailIcon size={20} className="text-gray-500" />
                      <span className="text-gray-900">{formData.email || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-primary"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <PhoneIcon size={20} className="text-gray-500" />
                      <span className="text-gray-900">{formData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <BuildingIcon size={20} className="text-gray-500" />
                    <span className="text-gray-900">{formData.department || 'Not set'}</span>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <ShieldIcon size={20} className="text-gray-500" />
                    <span className="text-gray-900 capitalize">{formData.role || 'Not set'}</span>
                  </div>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CalendarIcon size={20} className="text-gray-500" />
                    <span className="text-gray-900">
                      {formData.joinDate 
                        ? new Date(formData.joinDate).toLocaleDateString()
                        : 'Not available'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-glass">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Your Achievements
              </h3>
              
              {loadingStates.achievements ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner w-8 h-8"></div>
                  <span className="ml-3 text-gray-600">Loading achievements...</span>
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement._id} className={`achievement-badge-card ${!achievement.isUnlocked ? 'opacity-50' : ''}`}>
                      <div className="text-3xl mb-3">{achievement.icon || '🏆'}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-sage-600 mt-2">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                      {achievement.progress !== undefined && !achievement.isUnlocked && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-sage-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((achievement.progress / achievement.targetValue) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.progress} / {achievement.targetValue}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon size={48} className="mx-auto text-gray-400 mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Achievements Yet</h4>
                  <p className="text-gray-600">
                    Start your wellness journey to unlock achievements!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* Notifications */}
              <div className="card-glass">
                <div className="flex items-center space-x-3 mb-6">
                  <BellIcon size={24} className="text-sage-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Notification Preferences
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Daily Check-in Reminders</h4>
                      <p className="text-sm text-gray-600">Get reminded to complete your daily wellness check-in</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-sage-600 rounded focus:ring-sage-300" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Survey Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications about new surveys</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-sage-600 rounded focus:ring-sage-300" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Achievement Updates</h4>
                      <p className="text-sm text-gray-600">Get notified when you earn new achievements</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-sage-600 rounded focus:ring-sage-300" />
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <SlackIntegrationCard />

              {/* Security */}
              <div className="card-glass">
                <div className="flex items-center space-x-3 mb-6">
                  <KeyIcon size={24} className="text-sage-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Security & Privacy
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-1">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </button>
                  
                  <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-1">Privacy Settings</h4>
                    <p className="text-sm text-gray-600">Control who can see your wellness data</p>
                  </button>
                  
                  <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <h4 className="font-medium text-gray-900 mb-1">Export Data</h4>
                    <p className="text-sm text-gray-600">Download your wellness data</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Profile;