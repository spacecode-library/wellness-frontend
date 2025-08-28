import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, SearchIcon } from 'lucide-react';
import Button from '../../components/ui/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-sage-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Error Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="mb-8"
        >
          <div className="w-32 h-32 bg-sage-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon size={48} className="text-sage-600" />
          </div>
          <div className="text-8xl font-bold text-sage-300 mb-4">404</div>
        </motion.div>

        {/* Error Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back to your wellness journey.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              icon={<HomeIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={<ArrowLeftIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Go Back
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact our support team for assistance.
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute top-20 left-10 w-4 h-4 bg-sage-300 rounded-full opacity-20"></div>
          <div className="absolute top-40 right-16 w-6 h-6 bg-sage-400 rounded-full opacity-15"></div>
          <div className="absolute bottom-32 left-20 w-3 h-3 bg-sage-500 rounded-full opacity-25"></div>
          <div className="absolute bottom-20 right-12 w-5 h-5 bg-sage-300 rounded-full opacity-10"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;