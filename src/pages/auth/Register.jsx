import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, BuildingIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

// Store imports
import useAuthStore from '../../store/authStore';

// Component imports
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

/**
 * Register Page Component
 * Professional employee registration with form validation
 */
function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    role: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Full name is required';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      errors.name = 'Full name must be between 2 and 100 characters';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    if (!formData.employeeId) {
      errors.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.length < 3 || formData.employeeId.length > 20) {
      errors.employeeId = 'Employee ID must be between 3 and 20 characters';
    } else if (!/^[a-zA-Z0-9\-_]+$/.test(formData.employeeId)) {
      errors.employeeId = 'Employee ID can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
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
    
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
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
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        department: formData.department,
        role: formData.role,
      });

      if (result.success) {
        // Clear form and errors before navigation
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          employeeId: '',
          department: '',
          role: '',
          phone: ''
        });
        clearError();
        
        // Show success message and redirect to login
        navigate('/login', {
          state: {
            message: 'Registration successful! Please check your email to verify your account.',
            type: 'success'
          },
          replace: true
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const departments = [
    'Engineering',
    'Marketing', 
    'Sales',
    'HR',
    'Finance',
    'Operations',
    'Product'
  ];

  const roles = [
    'employee',
    'hr', 
    'admin'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Join WelldifyAI
        </h2>
        <p className="text-gray-600">
          Create your account to start your wellness journey
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  Registration Failed
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Name Field */}
        <div>
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            icon={<UserIcon size={20} />}
            error={formErrors.name}
            disabled={isLoading}
            required
            animate
          />
        </div>

        {/* Email Field */}
        <div>
          <Input
            label="Work Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your work email"
            icon={<MailIcon size={20} />}
            error={formErrors.email}
            disabled={isLoading}
            required
            animate
          />
        </div>

        {/* Employee ID Field */}
        <div>
          <Input
            label="Employee ID"
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="Enter your employee ID"
            icon={<UserIcon size={20} />}
            error={formErrors.employeeId}
            disabled={isLoading}
            required
            animate
          />
        </div>

        {/* Department Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Department
          </label>
          <div className="relative">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`input-primary w-full pl-11 ${formErrors.department ? 'border-red-300' : ''}`}
              disabled={isLoading}
              required
            >
              <option value="">Select your department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <BuildingIcon size={20} className="text-gray-400" />
            </div>
          </div>
          {formErrors.department && (
            <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`input-primary w-full pl-11 ${formErrors.role ? 'border-red-300' : ''}`}
              disabled={isLoading}
              required
            >
              <option value="">Select your role</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <UserIcon size={20} className="text-gray-400" />
            </div>
          </div>
          {formErrors.role && (
            <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
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

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            icon={<LockIcon size={20} />}
            error={formErrors.confirmPassword}
            disabled={isLoading}
            required
            animate
          />
          <motion.button
            type="button"
            className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
          disabled={isLoading}
          animate
        >
          Create Account
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-sage-600 hover:text-sage-500 transition-colors duration-200"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default Register;