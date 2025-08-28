import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';
import LoadingState from '../../components/shared/LoadingState';
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';

function Onboarding() {
  const [currentSection, setCurrentSection] = useState(0);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuthStore();
  const { toast } = useToast();

  // Load questionnaire on component mount
  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        console.log('🔍 ONBOARDING COMPONENT - Starting questionnaire load...');
        const result = await api.getOnboardingQuestionnaire();
        console.log('🔍 ONBOARDING COMPONENT - API Response:', result);
        
        if (result.success) {
          console.log('🔍 ONBOARDING COMPONENT - Setting questionnaire:', result.data.questionnaire);
          setQuestionnaire(result.data.questionnaire);
        } else {
          console.error('🔍 ONBOARDING COMPONENT - API returned success: false');
        }
      } catch (error) {
        console.error('🔍 ONBOARDING COMPONENT - Failed to load questionnaire:', error);
        toast.error('Failed to load onboarding questionnaire', 'Error');
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [toast]);

  if (loading) {
    return <LoadingState message="Loading onboarding questionnaire..." />;
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load onboarding</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  console.log('🔍 ONBOARDING COMPONENT - Processing questionnaire:', questionnaire);
  
  // Handle both old and new questionnaire formats
  const sections = questionnaire.sections || Object.keys(questionnaire);
  const currentSectionData = questionnaire.sections 
    ? questionnaire.sections[currentSection] 
    : questionnaire[sections[currentSection]];
    
  console.log('🔍 ONBOARDING COMPONENT - Sections:', sections);
  console.log('🔍 ONBOARDING COMPONENT - Current section data:', currentSectionData);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isCurrentSectionComplete = () => {
    if (!currentSectionData || !currentSectionData.questions) return false;
    
    return currentSectionData.questions.every(question => {
      if (!question.required) return true;
      const response = responses[question.id];
      
      if (question.type === 'multiselect') {
        return Array.isArray(response) && response.length > 0;
      }
      return response !== undefined && response !== null && response !== '';
    });
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const result = await api.submitOnboardingResponses(responses);
      
      if (result.success) {
        // Update user's onboarding status in auth store
        completeOnboarding();

        toast.success('Onboarding completed successfully! Welcome to WelldifyAI!', 'Welcome!');
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error(
        error.message || 'Failed to complete onboarding. Please try again.',
        'Error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'select':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="input-primary w-full"
              required={question.required}
            >
              <option value="">Select an option...</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'scale':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: question.scale.max }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleResponse(question.id, num)}
                  className={`p-3 rounded-lg border text-center ${
                    value === num
                      ? 'bg-sage-600 text-white border-sage-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">{num}</div>
                  {question.labels && question.labels[num] && (
                    <div className="text-xs mt-1">{question.labels[num]}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];
        const maxSelections = question.max_selections || question.options.length;
        
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
              {maxSelections < question.options.length && (
                <span className="text-sm text-gray-500 ml-2">
                  (Select up to {maxSelections})
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((option) => {
                const isSelected = selectedValues.includes(option);
                const canSelect = selectedValues.length < maxSelections || isSelected;
                
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleResponse(
                          question.id,
                          selectedValues.filter(v => v !== option)
                        );
                      } else if (canSelect) {
                        handleResponse(
                          question.id,
                          [...selectedValues, option]
                        );
                      }
                    }}
                    disabled={!canSelect}
                    className={`p-3 text-sm rounded-lg border text-left ${
                      isSelected
                        ? 'bg-sage-600 text-white border-sage-600'
                        : canSelect
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const progress = ((currentSection + 1) / sections.length) * 100;
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-green-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {currentSection + 1}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {currentSectionData.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Section {currentSection + 1} of {sections.length}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-sage-500 to-green-500 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="card-glass"
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentSectionData.title}
                </h1>
                <p className="text-gray-600">
                  Please answer all required questions to continue.
                </p>
              </div>
              
              <div className="space-y-6">
                {currentSectionData.questions.map(renderQuestion)}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentSection === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                    currentSection === 0
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeftIcon size={16} />
                  <span>Back</span>
                </button>
                
                {isLastSection ? (
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!isCurrentSectionComplete() || submitting}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
                      !isCurrentSectionComplete() || submitting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-sage-600 text-white hover:bg-sage-700'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="loading-spinner w-4 h-4"></div>
                        <span>Completing...</span>
                      </>
                    ) : (
                      <span>Complete Onboarding</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentSectionComplete()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      !isCurrentSectionComplete()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-sage-600 text-white hover:bg-sage-700'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRightIcon size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;