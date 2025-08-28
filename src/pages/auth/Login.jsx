import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from 'lucide-react';

// Store imports
import useAuthStore from '../../store/authStore';

// Component imports
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';

/**
 * Login Page Component
 * Premium design with smooth animations and form validation
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, errorData, clearError } = useAuthStore();
  
  const [successMessage, setSuccessMessage] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Check for success messages from other pages
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        remember: formData.remember,
      });

      if (result.success) {
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!errorData.email) return;
    
    setResendingVerification(true);
    try {
      const response = await api.resendVerification(errorData.email);
      if (response.success) {
        setSuccessMessage('Verification email sent! Please check your inbox.');
        clearError();
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back
        </h2>
        <p className="text-gray-600">
          Sign in to continue your wellness journey
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon size={20} className="text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm text-green-700">
                  {successMessage}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Global Error Message */}
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
                <h3 className="text-sm font-semibold text-red-800">
                  {errorData.requiresEmailVerification ? 'Email Verification Required' : 'Authentication Failed'}
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {error === 'Invalid email or password' 
                    ? 'Please check your email and password and try again.'
                    : error
                  }
                </div>
                {errorData.requiresEmailVerification && (
                  <div className="mt-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}
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
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            icon={<MailIcon size={20} />}
            error={formErrors.email}
            disabled={isLoading}
            required
            animate
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            icon={<LockIcon size={20} />}
            error={formErrors.password}
            disabled={isLoading}
            required
            animate
          />
          <motion.button
            type="button"
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </motion.button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-sage-600 hover:text-sage-500 transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          animate
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">New to WelldifyAI?</span>
        </div>
      </div>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <Link
          to="/register"
          className="text-sm font-medium text-sage-600 hover:text-sage-500 transition-colors duration-200"
        >
          Create your wellness account
        </Link>
      </div>

    </motion.div>
  );
}

export default Login;