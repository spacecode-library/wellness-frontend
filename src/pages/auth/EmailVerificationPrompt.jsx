import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MailIcon, 
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LogOutIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function EmailVerificationPrompt() {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('Email address not found', 'Error');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const response = await api.resendVerification(user.email);
      
      if (response.success) {
        toast.success('Verification email sent! Please check your inbox.', 'Email Sent');
        setResendSuccess(true);
      } else {
        toast.error(response.message || 'Failed to send verification email', 'Error');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(
        error.message || 'Failed to send verification email. Please try again.',
        'Error'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircleIcon size={32} className="text-yellow-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Your Email Address
            </h1>
            
            <p className="text-gray-600 mb-2">
              Welcome {user?.name}! We need to verify your email address before you can access all features.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              We've sent a verification link to:
              <br />
              <span className="font-medium text-gray-700">{user?.email}</span>
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <MailIcon size={20} className="text-yellow-600 mr-3 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium text-yellow-900">Check Your Email</div>
                  <div className="text-sm text-yellow-700">
                    Click the verification link in the email we sent you. If you don't see it, check your spam folder.
                  </div>
                </div>
              </div>
            </div>

            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start">
                  <CheckCircleIcon size={20} className="text-green-600 mr-3 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium text-green-900">Email Sent!</div>
                    <div className="text-sm text-green-700">
                      We've sent a new verification link to your email address.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <>
                    <RefreshCwIcon size={16} className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MailIcon size={16} className="mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary w-full"
              >
                <LogOutIcon size={16} className="mr-2" />
                Sign Out
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>
                Need help? Contact{' '}
                <a href="mailto:support@wellnessai.com" className="text-sage-600 hover:text-sage-700 font-medium">
                  support@wellnessai.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Help Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white/60 backdrop-blur-sm rounded-lg p-4"
        >
          <h3 className="font-medium text-gray-900 mb-2">Didn't receive the email?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure {user?.email} is correct</li>
            <li>• Wait a few minutes and try resending</li>
          </ul>
        </motion.div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-sage-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-3xl" />
      </div>
    </div>
  );
}

export default EmailVerificationPrompt;