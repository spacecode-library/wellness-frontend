import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ActivityIcon, 
  BrainIcon, 
  MoonIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from 'lucide-react';

function WellnessStep({ onNext, onBack, userData, onUpdateData }) {
  const [formData, setFormData] = useState({
    currentWellness: userData.currentWellness || '',
    wellnessGoals: userData.wellnessGoals || [],
    stressFactors: userData.stressFactors || [],
    preferredActivities: userData.preferredActivities || [],
    wellnessHistory: userData.wellnessHistory || [],
    ...userData
  });
  const [errors, setErrors] = useState({});

  const wellnessLevels = [
    { value: 'excellent', label: 'Excellent', emoji: '😊', color: 'text-green-600' },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'text-green-500' },
    { value: 'fair', label: 'Fair', emoji: '😐', color: 'text-yellow-500' },
    { value: 'poor', label: 'Poor', emoji: '😔', color: 'text-orange-500' },
    { value: 'struggling', label: 'Struggling', emoji: '😞', color: 'text-red-500' }
  ];

  const wellnessGoals = [
    { id: 'stress', label: 'Reduce Stress', icon: BrainIcon },
    { id: 'sleep', label: 'Improve Sleep', icon: MoonIcon },
    { id: 'energy', label: 'Increase Energy', icon: ActivityIcon },
    { id: 'mood', label: 'Better Mood', icon: HeartIcon },
    { id: 'focus', label: 'Enhance Focus', icon: BrainIcon },
    { id: 'balance', label: 'Work-Life Balance', icon: ActivityIcon }
  ];

  const stressFactors = [
    'Heavy workload', 'Tight deadlines', 'Difficult colleagues', 
    'Lack of recognition', 'Poor work-life balance', 'Job insecurity',
    'Unclear expectations', 'Limited growth opportunities', 'Technology issues'
  ];

  const activities = [
    'Meditation', 'Exercise', 'Reading', 'Music', 'Walking',
    'Yoga', 'Breathing exercises', 'Journaling', 'Social activities'
  ];

  const wellnessHistoryOptions = [
    'Mental health counseling', 'Stress management programs', 
    'Fitness programs', 'Nutrition counseling', 'Sleep studies',
    'Mindfulness training', 'None of the above'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentWellness) {
      newErrors.currentWellness = 'Please rate your current wellness level';
    }

    if (formData.wellnessGoals.length === 0) {
      newErrors.wellnessGoals = 'Please select at least one wellness goal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleArrayChange = (field, value) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
    
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's Talk About Your Wellness
        </h2>
        <p className="text-gray-600">
          This helps us provide personalized recommendations and insights
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Wellness Level */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            How would you rate your current overall wellness? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {wellnessLevels.map((level) => (
              <motion.button
                key={level.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, currentWellness: level.value }))}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  formData.currentWellness === level.value
                    ? 'border-sage-500 bg-sage-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{level.emoji}</div>
                <div className={`font-medium ${level.color}`}>{level.label}</div>
              </motion.button>
            ))}
          </div>
          {errors.currentWellness && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircleIcon size={16} className="mr-1" />
              {errors.currentWellness}
            </div>
          )}
        </div>

        {/* Wellness Goals */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            What are your main WelldifyAI wellness goals? * (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {wellnessGoals.map((goal) => (
              <motion.button
                key={goal.id}
                type="button"
                onClick={() => handleArrayChange('wellnessGoals', goal.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.wellnessGoals.includes(goal.id)
                    ? 'border-sage-500 bg-sage-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <goal.icon size={20} className="text-sage-600 mr-3" />
                  <span className="font-medium text-gray-900">{goal.label}</span>
                  {formData.wellnessGoals.includes(goal.id) && (
                    <CheckCircleIcon size={16} className="text-sage-600 ml-auto" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          {errors.wellnessGoals && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircleIcon size={16} className="mr-1" />
              {errors.wellnessGoals}
            </div>
          )}
        </div>

        {/* Stress Factors */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            What are your main sources of work stress? (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {stressFactors.map((factor) => (
              <motion.button
                key={factor}
                type="button"
                onClick={() => handleArrayChange('stressFactors', factor)}
                className={`p-3 rounded-lg border text-sm transition-all text-left ${
                  formData.stressFactors.includes(factor)
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{factor}</span>
                  {formData.stressFactors.includes(factor) && (
                    <CheckCircleIcon size={14} className="text-red-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preferred Activities */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            What wellness activities do you enjoy? (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {activities.map((activity) => (
              <motion.button
                key={activity}
                type="button"
                onClick={() => handleArrayChange('preferredActivities', activity)}
                className={`p-3 rounded-lg border text-sm transition-all text-left ${
                  formData.preferredActivities.includes(activity)
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{activity}</span>
                  {formData.preferredActivities.includes(activity) && (
                    <CheckCircleIcon size={14} className="text-green-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Wellness History */}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            Have you participated in any wellness programs before? (Optional)
          </label>
          <div className="space-y-2">
            {wellnessHistoryOptions.map((option) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleArrayChange('wellnessHistory', option)}
                className={`w-full p-3 rounded-lg border text-sm transition-all text-left ${
                  formData.wellnessHistory.includes(option)
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {formData.wellnessHistory.includes(option) && (
                    <CheckCircleIcon size={16} className="text-blue-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="text-left">
              <h4 className="font-medium text-blue-900 mb-1">Privacy & Confidentiality</h4>
              <p className="text-sm text-blue-700">
                Your wellness information is completely confidential and will only be used to provide 
                personalized recommendations. Individual responses are never shared with managers or colleagues.
              </p>
            </div>
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

export default WellnessStep;