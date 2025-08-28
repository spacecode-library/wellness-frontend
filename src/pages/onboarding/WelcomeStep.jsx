import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UsersIcon, 
  TrendingUpIcon, 
  GiftIcon,
  ArrowRightIcon 
} from 'lucide-react';

function WelcomeStep({ onNext, userData }) {
  const features = [
    {
      icon: HeartIcon,
      title: 'Daily Wellness Check-ins',
      description: 'Track your mood and well-being with simple daily check-ins',
      color: 'text-red-500'
    },
    {
      icon: TrendingUpIcon,
      title: 'Personal Insights',
      description: 'Get AI-powered insights about your wellness trends',
      color: 'text-green-500'
    },
    {
      icon: UsersIcon,
      title: 'Team Connection',
      description: 'Stay connected with your team\'s wellness journey',
      color: 'text-blue-500'
    },
    {
      icon: GiftIcon,
      title: 'Rewards & Recognition',
      description: 'Earn Happy Coins and redeem exciting rewards',
      color: 'text-purple-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <HeartIcon size={40} className="text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to WellifyAI, {userData?.name?.split(' ')[0] || 'there'}!
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're excited to have you join our wellness community. Let's take a quick tour of what makes 
          WellifyAI special and how it can help improve your well-being at work.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg bg-gray-50`}>
                <feature.icon size={24} className={feature.color} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Company Wellness Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-sage-50 to-green-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Join a Thriving Wellness Community
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-sage-600">500+</div>
            <div className="text-sm text-gray-600">Daily Check-ins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sage-600">95%</div>
            <div className="text-sm text-gray-600">Employee Satisfaction</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sage-600">50+</div>
            <div className="text-sm text-gray-600">Wellness Challenges</div>
          </div>
        </div>
      </motion.div>

      {/* Privacy & Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-blue-50 rounded-lg p-4 mb-8"
      >
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-blue-900 mb-1">Your Privacy Matters</h4>
            <p className="text-sm text-blue-700">
              All your wellness data is confidential and only used to provide you with personalized insights. 
              Your individual data is never shared with managers or colleagues.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        onClick={onNext}
        className="btn-primary text-lg px-8 py-3 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Let's Get Started
        <ArrowRightIcon size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}

export default WelcomeStep;