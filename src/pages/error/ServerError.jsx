import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ServerIcon, RefreshCwIcon, HomeIcon } from 'lucide-react';
import Button from '../../components/ui/Button';

function ServerError() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
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
          <div className="w-32 h-32 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ServerIcon size={48} className="text-red-600" />
          </div>
          <div className="text-8xl font-bold text-red-300 mb-4">500</div>
        </motion.div>

        {/* Error Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Server Error
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We're experiencing some technical difficulties. Our team has been 
            notified and is working to resolve this issue.
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
              onClick={handleRefresh}
              variant="primary"
              icon={<RefreshCwIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Try Again
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              icon={<HomeIcon size={18} />}
              fullWidth
              className="sm:flex-1"
            >
              Go Home
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            If the problem persists, please contact our support team.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ServerError;