import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MailIcon, ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';

// Component imports
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';

/**
 * Forgot Password Page Component
 * Professional password reset request form
 */
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  // Validate email
  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.forgotPassword({ email });
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircleIcon size={32} className="text-green-600" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We've sent a password reset link to <strong>{email}</strong>.
          Please check your email and follow the instructions to reset your password.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            variant="outline"
            fullWidth
          >
            Send another email
          </Button>
          
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Back to Sign In
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Didn't receive the email? Check your spam folder or contact your IT administrator.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-sage-600 hover:text-sage-500 transition-colors duration-200 mb-6"
        >
          <ArrowLeftIcon size={20} />
          <span className="text-sm font-medium">Back to Sign In</span>
        </Link>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h2>
          <p className="text-gray-600">
            No worries! Enter your email address and we'll send you a reset link.
          </p>
        </div>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Field */}
        <div>
          <Input
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your work email"
            icon={<MailIcon size={20} />}
            error={error && !email ? 'Email is required' : ''}
            disabled={isLoading}
            required
            animate
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading || !email}
          animate
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-sage-600 hover:text-sage-500 transition-colors duration-200"
          >
            Sign in here
          </Link>
        </p>
      </div>

      {/* Contact Support */}
      <div className="mt-6 p-4 bg-sage-50 rounded-xl border border-sage-200">
        <div className="text-center">
          <p className="text-sm text-sage-800 font-medium mb-1">
            Need additional help?
          </p>
          <p className="text-xs text-sage-600">
            Contact your HR department or IT administrator for assistance.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ForgotPassword;