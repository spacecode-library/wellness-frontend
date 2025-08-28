import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from 'lucide-react';

// Component imports
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';

/**
 * Reset Password Page Component
 * Professional password reset form with validation
 */
function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if token is valid on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      setError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.resetPassword({ 
        token, 
        password: formData.password 
      });
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password reset successful! Please sign in with your new password.',
            type: 'success'
          }
        });
      }, 3000);
    } catch (error) {
      setError('Failed to reset password. The reset link may have expired.');
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
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your password has been successfully updated. You will be redirected to the sign-in page in a few seconds.
        </p>
        
        <Link to="/login">
          <Button variant="primary" fullWidth>
            Sign In Now
          </Button>
        </Link>
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
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Your Password
        </h2>
        <p className="text-gray-600">
          Create a new secure password for your account
        </p>
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

        {/* New Password Field */}
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            icon={<LockIcon size={20} />}
            error={formErrors.password}
            disabled={isLoading || !token}
            required
            animate
          />
          <motion.button
            type="button"
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!token}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </motion.button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            icon={<LockIcon size={20} />}
            error={formErrors.confirmPassword}
            disabled={isLoading || !token}
            required
            animate
          />
          <motion.button
            type="button"
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!token}
          >
            {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </motion.button>
        </div>

        {/* Password Requirements */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="space-y-1">
            <li className={`flex items-center space-x-2 ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
              <span>{formData.password.length >= 8 ? '✓' : '•'}</span>
              <span>At least 8 characters</span>
            </li>
            <li className={`flex items-center space-x-2 ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}`}>
              <span>{/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? '✓' : '•'}</span>
              <span>Uppercase and lowercase letters</span>
            </li>
            <li className={`flex items-center space-x-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
              <span>{/(?=.*\d)/.test(formData.password) ? '✓' : '•'}</span>
              <span>At least one number</span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading || !token}
          animate
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-sage-600 hover:text-sage-500 transition-colors duration-200"
        >
          Back to Sign In
        </Link>
      </div>
    </motion.div>
  );
}

export default ResetPassword;