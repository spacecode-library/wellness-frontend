import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3Icon } from 'lucide-react';
import { useSurveys } from '../../hooks/useApi';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import { useToast } from '../../components/shared/Toast';

function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userActivity, setUserActivity] = useState('idle'); // idle, answering, submitting

  const { getActiveSurveys, submitSurveyResponse } = useSurveys();
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        const surveysData = await getActiveSurveys().catch(err => {
          console.warn('Failed to load surveys:', err);
          return [];
        });
        
        // console.log('🔍 SURVEYS - Raw data received:', surveysData);
        
        // Handle different possible response structures
        let surveysList = [];
        if (Array.isArray(surveysData)) {
          surveysList = surveysData;
        } else if (surveysData && Array.isArray(surveysData.surveys)) {
          surveysList = surveysData.surveys;
        } else if (surveysData && surveysData.data && Array.isArray(surveysData.data.surveys)) {
          surveysList = surveysData.data.surveys;
        } else if (surveysData && surveysData.data && Array.isArray(surveysData.data)) {
          surveysList = surveysData.data;
        }
        
        // console.log('🔍 SURVEYS - Final surveys list:', surveysList);
        
        setSurveys(surveysList || []);
        // For now, we'll track completed surveys locally in state
        // until the backend survey history endpoint is fixed
        setCompletedSurveys([]);  
      } catch (error) {
        console.error('Error loading surveys:', error);
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, [getActiveSurveys]);

  const handleStartSurvey = (survey) => {
    setActiveSurvey(survey);
    setResponses({});
  };

  const handleResponseChange = (questionId, value) => {
    setUserActivity('answering');
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Reset to idle after 3 seconds of no activity
    setTimeout(() => {
      setUserActivity('idle');
    }, 3000);
    
    console.log(`🔍 USER ACTIVITY - User answered question ${questionId}: ${value}`);
  };

  const handleSubmitSurvey = async () => {
    if (!activeSurvey || isSubmitting) return;

    const unansweredQuestions = activeSurvey.questions?.filter(
      q => q.required && (!responses[q._id || q.id] || (typeof responses[q._id || q.id] === 'string' && responses[q._id || q.id].trim() === ''))
    );

    if (unansweredQuestions?.length > 0) {
      toast.warning('Please answer all required questions before submitting.', 'Incomplete Survey');
      return;
    }

    setIsSubmitting(true);
    setUserActivity('submitting');
    try {
      console.log('🔍 SURVEY SUBMISSION - Survey ID:', activeSurvey._id);
      console.log('🔍 SURVEY SUBMISSION - Responses:', responses);
      console.log('🔍 USER ACTIVITY - User is submitting survey:', activeSurvey.title);
      
      await submitSurveyResponse(activeSurvey._id, responses);

      setCompletedSurveys(prev => [...prev, {
        survey_id: activeSurvey._id,
        survey_title: activeSurvey.title,
        completed_at: new Date().toISOString()
      }]);
      
      setActiveSurvey(null);
      setResponses({});
      setUserActivity('idle');
      toast.success('Survey submitted successfully! Thank you for your feedback.', 'Survey Complete');
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.', 'Submission Error');
    } finally {
      setIsSubmitting(false);
      setUserActivity('idle');
    }
  };

  const isCompleted = (surveyId) => {
    return completedSurveys.some(cs => cs.survey_id === surveyId);
  };

  const getAvailableSurveys = () => {
    if (!Array.isArray(surveys)) {
      console.warn('🔍 SURVEYS - surveys is not an array:', surveys);
      return [];
    }
    
    const filtered = surveys.filter(survey => {
      // Check if survey is active
      const isActive = survey.isActive && survey.status === 'active';
      return isActive;
    });
    return filtered;
  };

  if (loading) {
    return <LoadingState message="Loading surveys..." size="large" />;
  }

  if (activeSurvey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <button
            onClick={() => setActiveSurvey(null)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <span>←</span>
            <span>Back to Surveys</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeSurvey.title}
          </h1>
          {activeSurvey.description && (
            <p className="text-gray-600 mb-6">{activeSurvey.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {activeSurvey.questions?.map((question, index) => (
            <motion.div
              key={question._id || question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-glass"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {index + 1}. {question.question || question.question_text}
              </h3>

              {question.type === 'multiple_choice' ? (
                <div className="space-y-4">
                  {console.log('🔍 MULTIPLE CHOICE - Question options:', question.options)}
                  {question.options && question.options.length > 0 ? (
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={option.id || option.text || option || optionIndex}
                          className="flex items-start space-x-4 cursor-pointer p-4 rounded-lg border-2 border-gray-100 hover:border-sage-200 hover:bg-sage-50 transition-all duration-200"
                        >
                          <input
                            type="radio"
                            name={`question_${question._id || question.id}`}
                            value={option.text || option}
                            checked={responses[question._id || question.id] === (option.text || option)}
                            onChange={(e) => handleResponseChange(question._id || question.id, e.target.value)}
                            className="w-5 h-5 text-sage-500 focus:ring-sage-300 focus:ring-2 mt-0.5"
                          />
                          <div className="flex-1">
                            <span className="text-gray-800 font-medium leading-relaxed">
                              {option.text || option}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-yellow-800 font-medium">⚠️ No options available</div>
                      <div className="text-yellow-600 text-sm mt-1">
                        This question configuration is incomplete. Please contact support.
                      </div>
                    </div>
                  )}
                  {question.options && question.options.length > 0 && (
                    <div className="text-center mt-4">
                      <div className="inline-flex items-center space-x-2 bg-sage-50 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-sage-700">Selected:</span>
                        <span className="text-sm font-bold text-sage-800">
                          {responses[question._id || question.id] || 'None'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : question.type === 'scale' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-4">
                    <span className="bg-gray-100 px-3 py-1 rounded">
                      {question.scale?.labels?.[question.scale?.min] || 'Low'}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded">
                      {question.scale?.labels?.[question.scale?.max] || 'High'}
                    </span>
                  </div>
                  
                  {/* Professional scale layout with proper spacing */}
                  <div className="flex justify-between items-center gap-3 px-4">
                    {Array.from({ 
                      length: Math.min((question.scale?.max || 10) - (question.scale?.min || 0) + 1, 10)
                    }, (_, i) => (question.scale?.min || 0) + i).map((value) => (
                      <label
                        key={value}
                        className="flex flex-col items-center cursor-pointer p-3 rounded-lg hover:bg-sage-50 transition-all duration-200 min-w-[60px]"
                      >
                        <input
                          type="radio"
                          name={`question_${question._id || question.id}`}
                          value={value.toString()}
                          checked={responses[question._id || question.id] === value.toString()}
                          onChange={(e) => handleResponseChange(question._id || question.id, e.target.value)}
                          className="mb-3 w-5 h-5 text-sage-500 focus:ring-sage-300 focus:ring-2"
                        />
                        <span className="text-sm font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                          {value}
                        </span>
                        {question.scale?.labels?.[value] && (
                          <span className="text-xs text-gray-600 mt-1 text-center max-w-[80px]">
                            {question.scale.labels[value]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-sage-50 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-sage-700">Selected:</span>
                      <span className="text-sm font-bold text-sage-800">
                        {responses[question._id || question.id] || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : question.type === 'boolean' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center justify-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200">
                      <input
                        type="radio"
                        name={`question_${question._id || question.id}`}
                        value="true"
                        checked={responses[question._id || question.id] === 'true'}
                        onChange={(e) => handleResponseChange(question._id || question.id, e.target.value)}
                        className="w-5 h-5 text-green-500 focus:ring-green-300 focus:ring-2"
                      />
                      <span className="text-gray-800 font-medium">✓ Yes</span>
                    </label>
                    <label className="flex items-center justify-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                      <input
                        type="radio"
                        name={`question_${question._id || question.id}`}
                        value="false"
                        checked={responses[question._id || question.id] === 'false'}
                        onChange={(e) => handleResponseChange(question._id || question.id, e.target.value)}
                        className="w-5 h-5 text-red-500 focus:ring-red-300 focus:ring-2"
                      />
                      <span className="text-gray-800 font-medium">✗ No</span>
                    </label>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-sage-50 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-sage-700">Selected:</span>
                      <span className="text-sm font-bold text-sage-800">
                        {responses[question._id || question.id] === 'true' ? 'Yes' : 
                         responses[question._id || question.id] === 'false' ? 'No' : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={responses[question._id || question.id] || ''}
                    onChange={(e) => handleResponseChange(question._id || question.id, e.target.value)}
                    placeholder="Please share your thoughts..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-sage-400 focus:ring-2 focus:ring-sage-200 transition-all duration-200 resize-none"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      {responses[question._id || question.id]?.length || 0}/1000 characters
                    </span>
                    <span>
                      {responses[question._id || question.id] ? '✓ Answered' : 'Optional'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          <div className="card-glass">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Progress: {Object.keys(responses).length} / {activeSurvey.questions?.length || 0} questions answered
              </div>
              <button
                onClick={handleSubmitSurvey}
                disabled={isSubmitting || Object.keys(responses).length !== (activeSurvey.questions?.length || 0)}
                className={`btn-primary ${
                  isSubmitting || Object.keys(responses).length !== (activeSurvey.questions?.length || 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Survey'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const activeSurveys = getAvailableSurveys();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <PageHeader
        title="Pulse Surveys"
        subtitle="Share your feedback to help improve our workplace wellness"
        icon={BarChart3Icon}
      />

      {activeSurveys.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Active Surveys"
          description="There are no surveys available at the moment. Check back later!"
        />
      ) : (
        <div className="space-y-6">
          {activeSurveys.map((survey) => (
            <motion.div
              key={survey._id || survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="card-glass"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {survey.title}
                    </h3>
                    {isCompleted(survey._id || survey.id) && (
                      <span className="achievement-badge">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  
                  {survey.description && (
                    <p className="text-gray-600 mb-4">{survey.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>📊</span>
                      <span>{survey.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>~{Math.ceil((survey.questions?.length || 0) * 1.5)} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>Due {new Date(survey.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {isCompleted(survey._id || survey.id) ? (
                    <div className="text-center">
                      <div className="text-2xl mb-1">✅</div>
                      <span className="text-sm text-green-600 font-medium">
                        Thank you!
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartSurvey(survey)}
                      className="btn-primary"
                    >
                      Start Survey
                    </button>
                  )}
                  
                  {survey.reward_coins > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-sage-600 font-medium">
                      <span>🪙</span>
                      <span>+{survey.reward_coins} coins</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {completedSurveys.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Completed Surveys
          </h2>
          <div className="space-y-4">
            {completedSurveys.map((completed) => (
              <div
                key={`${completed.survey_id}-${completed.completed_at}`}
                className="card-primary opacity-75"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {completed.survey_title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Completed on {new Date(completed.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-green-600">
                    <span className="text-xl">✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Surveys;