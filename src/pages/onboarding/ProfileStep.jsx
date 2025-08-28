import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  BuildingIcon, 
  CalendarIcon, 
  MapPinIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CameraIcon
} from 'lucide-react';

function ProfileStep({ onNext, onBack, userData, onUpdateData }) {
  const [formData, setFormData] = useState({
    avatar: userData.avatar || '',
    department: userData.department || '',
    jobTitle: userData.jobTitle || '',
    startDate: userData.startDate || '',
    location: userData.location || '',
    bio: userData.bio || '',
    ...userData
  });
  const [errors, setErrors] = useState({});

  const departments = [
    'Engineering', 'Marketing', 'Sales', 'HR', 
    'Finance', 'Operations', 'Product', 'Design', 'Customer Success'
  ];

  const locations = [
    'New York, NY', 'San Francisco, CA', 'Austin, TX', 
    'Seattle, WA', 'Chicago, IL', 'Remote', 'Other'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Please enter your job title';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please enter your start date';
    }

    if (!formData.location) {
      newErrors.location = 'Please select your location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onUpdateData(formData);
      onNext();
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's Complete Your Profile
        </h2>
        <p className="text-gray-600">
          Help us personalize your experience by sharing a bit more about yourself
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center overflow-hidden">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={40} className="text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <CameraIcon size={16} className="text-gray-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <div className="relative">
            <BuildingIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className={`input-primary pl-10 ${errors.department ? 'border-red-300' : ''}`}
            >
              <option value="">Select your department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
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

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <div className="relative">
            <UserIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g., Software Engineer, Marketing Manager"
              className={`input-primary pl-10 ${errors.jobTitle ? 'border-red-300' : ''}`}
            />
          </div>
          {errors.jobTitle && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircleIcon size={16} className="mr-1" />
              {errors.jobTitle}
            </div>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <div className="relative">
            <CalendarIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={`input-primary pl-10 ${errors.startDate ? 'border-red-300' : ''}`}
            />
          </div>
          {errors.startDate && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircleIcon size={16} className="mr-1" />
              {errors.startDate}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Location *
          </label>
          <div className="relative">
            <MapPinIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`input-primary pl-10 ${errors.location ? 'border-red-300' : ''}`}
            >
              <option value="">Select your location</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          {errors.location && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircleIcon size={16} className="mr-1" />
              {errors.location}
            </div>
          )}
        </div>

        {/* Bio (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us about yourself (Optional)
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Share your interests, hobbies, or anything you'd like your colleagues to know..."
            rows={4}
            className="input-primary resize-none"
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.bio.length}/500 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary group"
          >
            <ArrowLeftIcon size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <button
            type="submit"
            className="btn-primary group"
          >
            Continue
            <ArrowRightIcon size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default ProfileStep;