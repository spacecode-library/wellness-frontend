import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MailIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  RefreshCwIcon,
  ArrowRightIcon,
  AlertCircleIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error, expired
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');

  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    setLoading(true);
    try {
      const response = await api.verifyEmail(verificationToken);
      
      if (response.success) {
        setVerificationStatus('success');
        
        // Update user's email verification status
        if (user) {
          await updateUser({ 
            ...user, 
            isEmailVerified: true 
          });
        }
        
        toast.success('Email verified successfully!', 'Welcome to WelldifyAI!');
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      } else {
        if (response.message?.includes('expired')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.message?.includes('expired')) {
        setVerificationStatus('expired');
      } else {
        setVerificationStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address', 'Error');
      return;
    }

    setResendLoading(true);
    try {
      const response = await api.resendVerification(email);
      
      if (response.success) {
        toast.success('Verification email sent! Please check your inbox.', 'Email Sent');
        setEmail(''); // Clear email field
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

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCwIcon size={32} className="text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we verify your email address...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full w-48 mx-auto"></div>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircleIcon size={32} className="text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified Successfully! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              Your email has been verified. You'll be redirected to your dashboard shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircleIcon size={20} className="text-green-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-green-900">All Set!</div>
                  <div className="text-sm text-green-700">
                    You now have full access to all WellifyAI features.
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary group"
            >
              Go to Dashboard
              <ArrowRightIcon size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircleIcon size={32} className="text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Link Expired
            </h1>
            <p className="text-gray-600 mb-6">
              This verification link has expired. Don't worry, we can send you a new one!
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircleIcon size={20} className="text-yellow-600 mr-3 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium text-yellow-900">Link Expired</div>
                  <div className="text-sm text-yellow-700">
                    Verification links expire after 24 hours for security reasons.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="input-primary"
                />
              </div>
              
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <RefreshCwIcon size={16} className="animate-spin" />
                ) : (
                  <MailIcon size={16} />
                )}
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
            </div>
          </motion.div>
        );

      case 'error':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your email address. This could be due to an invalid or expired link.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <XCircleIcon size={20} className="text-red-600 mr-3 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium text-red-900">Verification Failed</div>
                  <div className="text-sm text-red-700">
                    The verification link may be invalid, expired, or already used.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className="input-primary"
                />
              </div>
              
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="btn-primary w-full"
              >
                {resendLoading ? (
                  <RefreshCwIcon size={16} className="animate-spin" />
                ) : (
                  <MailIcon size={16} />
                )}
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        );
    }
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
          {renderContent()}
        </motion.div>
        
        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@wellnessai.com" className="text-sage-600 hover:text-sage-700 font-medium">
              support@wellnessai.com
            </a>
          </p>
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

export default EmailVerification;