import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  XIcon, 
  SaveIcon, 
  UserIcon,
  MailIcon,
  KeyIcon,
  BuildingIcon,
  UserCheckIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useToast } from '../shared/Toast';

function UserManagementModal({ isOpen, onClose, user = null, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    employeeId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { toast } = useToast();

  const roles = [
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr', label: 'HR' },
    { value: 'admin', label: 'Admin' }
  ];

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'HR', 
    'Finance', 'Operations', 'Product'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'employee',
        department: user.department || '',
        employeeId: user.employeeId || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        employeeId: '',
        isActive: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = { ...formData };
      if (user && !userData.password) {
        delete userData.password;
      }
      
      await onSave(userData, user);
      toast.success(
        user ? 'User updated successfully' : 'User created successfully',
        'Success'
      );
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to save user', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`input-primary pl-10 ${errors.name ? 'border-red-300' : ''}`}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircleIcon size={16} className="mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <MailIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`input-primary pl-10 ${errors.email ? 'border-red-300' : ''}`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircleIcon size={16} className="mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!user && '*'}
            </label>
            <div className="relative">
              <KeyIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`input-primary pl-10 ${errors.password ? 'border-red-300' : ''}`}
                placeholder={user ? "Leave blank to keep current password" : "Enter password"}
              />
            </div>
            {errors.password && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircleIcon size={16} className="mr-1" />
                {errors.password}
              </div>
            )}
            {!user && !errors.password && (
              <p className="mt-1 text-xs text-gray-500">
                Must contain at least 6 characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID *
            </label>
            <div className="relative">
              <UserCheckIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                className={`input-primary pl-10 ${errors.employeeId ? 'border-red-300' : ''}`}
                placeholder="Enter employee ID"
              />
            </div>
            {errors.employeeId && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircleIcon size={16} className="mr-1" />
                {errors.employeeId}
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="input-primary"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <div className="relative">
              <BuildingIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`input-primary pl-10 ${errors.department ? 'border-red-300' : ''}`}
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            {errors.department && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircleIcon size={16} className="mr-1" />
                {errors.department}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active user account
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              <SaveIcon size={16} />
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default UserManagementModal;