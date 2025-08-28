import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  StarIcon, 
  HeartIcon, 
  GiftIcon,
  TrendingUpIcon,
  ArrowRightIcon,
  BellIcon,
  MailIcon,
  SmartphoneIcon
} from 'lucide-react';

function CompletionStep({ onComplete, userData }) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    reminders: true
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    onComplete({ ...userData, notifications: preferences });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl mx-auto"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.2, 
          type: "spring", 
          stiffness: 200,
          damping: 10
        }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <CheckCircleIcon size={40} className="text-white" />
          
          {/* Celebration particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos(i * 60 * Math.PI / 180) * 60,
                y: Math.sin(i * 60 * Math.PI / 180) * 60
              }}
              transition={{
                delay: 0.5 + i * 0.1,
                duration: 1.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Welcome to WelldifyAI, {userData?.name?.split(' ')[0]}!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          You're all set up and ready to start your WelldifyAI wellness journey with us. 
          Here's what you can expect in your first week:
        </p>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">What's Next?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-left">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <HeartIcon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Daily Check-ins</h4>
            </div>
            <p className="text-sm text-gray-600">
              Start tracking your daily mood and well-being. Takes less than 30 seconds!
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-left">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUpIcon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Personal Insights</h4>
            </div>
            <p className="text-sm text-gray-600">
              Get personalized recommendations based on your wellness data.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-left">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <GiftIcon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Earn Rewards</h4>
            </div>
            <p className="text-sm text-gray-600">
              Collect Happy Coins for participating and redeem exciting rewards!
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-left">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <StarIcon size={20} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">Join Challenges</h4>
            </div>
            <p className="text-sm text-gray-600">
              Participate in fun wellness challenges with your colleagues.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you'd like to stay updated on your WelldifyAI journey
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MailIcon size={20} className="text-gray-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-500">Weekly wellness summaries and important updates</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sage-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon size={20} className="text-gray-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Daily Reminders</div>
                <div className="text-sm text-gray-500">Gentle reminders for your daily check-ins</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reminders}
                onChange={(e) => handlePreferenceChange('reminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sage-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUpIcon size={20} className="text-gray-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Weekly Reports</div>
                <div className="text-sm text-gray-500">Your personal wellness insights and progress</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weeklyReports}
                onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sage-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Starter Bonus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-r from-sage-50 to-green-50 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center mr-4">
            <GiftIcon size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Welcome Bonus!</h4>
            <p className="text-sm text-gray-600">You've earned 50 Happy Coins to start your journey</p>
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
            <HeartIcon size={16} className="text-sage-600 mr-2" />
            <span className="font-semibold text-sage-600">50 Happy Coins</span>
          </div>
        </div>
      </motion.div>

      {/* Complete Setup Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={handleComplete}
        className="btn-primary text-lg px-12 py-4 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Start My Wellness Journey
        <ArrowRightIcon size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-sm text-gray-500 mt-4"
      >
        You can always update your preferences in your profile settings
      </motion.p>
    </motion.div>
  );
}

export default CompletionStep;