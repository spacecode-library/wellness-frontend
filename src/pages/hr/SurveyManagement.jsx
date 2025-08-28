import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Search as MagnifyingGlassIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  ClipboardList as ClipboardDocumentListIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as StopIcon,
  Star as StarIcon,
  BarChart3 as ChartBarIcon,
  CheckCircle as CheckCircleIcon,
  Send as PaperAirplaneIcon
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import SurveyDistributionModal from '../../components/survey/SurveyDistributionModal';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const SurveyManagement = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [distributingSurvey, setDistributingSurvey] = useState(null);

  const { user } = useAuthStore();
  const { toast } = useToast();

  const surveyTypes = [
    { value: 'all', label: 'All Types', icon: '📊' },
    { value: 'pulse', label: 'Pulse Survey', icon: '💓' },
    { value: 'onboarding', label: 'Onboarding Survey', icon: '🚀' },
    { value: 'feedback', label: 'Feedback Survey', icon: '💬' },
    { value: 'custom', label: 'Custom Survey', icon: '⚙️' }
  ];

  const questionTypes = [
    { value: 'scale', label: 'Scale (1-5)', icon: '⭐' },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
    { value: 'checkbox', label: 'Checkbox', icon: '✅' },
    { value: 'text', label: 'Text Response', icon: '📝' },
    { value: 'boolean', label: 'Yes/No', icon: '✅' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'closed', label: 'Closed', color: 'blue' },
    { value: 'archived', label: 'Archived', color: 'purple' }
  ];

  // Template surveys with research-backed questions
  const templateSurveys = [
    {
      title: "Employee Wellness Assessment",
      description: "Comprehensive survey to assess overall employee wellness, identify areas for improvement, and measure program effectiveness.",
      type: "pulse",
      estimatedTime: 8,
      questions: [
        {
          type: "scale",
          question: "How would you rate your overall wellness at work?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Poor",
              2: "Fair", 
              3: "Good",
              4: "Very Good",
              5: "Excellent"
            }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "Which wellness areas are most important to you? (Select up to 3)",
          options: [
            "Physical fitness and exercise",
            "Mental health and stress management",
            "Nutrition and healthy eating",
            "Sleep quality and rest",
            "Work-life balance",
            "Social connections and relationships",
            "Financial wellness",
            "Career development and growth"
          ],
          allowMultiple: true,
          maxSelections: 3,
          required: true
        },
        {
          type: "scale",
          question: "How effectively do you manage stress at work?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Not at all",
              2: "Slightly",
              3: "Moderately", 
              4: "Very",
              5: "Extremely"
            }
          },
          required: true
        },
        {
          type: "boolean",
          question: "Do you feel you have access to adequate wellness resources at work?",
          required: true
        },
        {
          type: "multiple_choice",
          question: "What wellness programs would you be most interested in?",
          options: [
            "On-site fitness classes",
            "Meditation and mindfulness sessions",
            "Nutrition workshops",
            "Mental health support groups",
            "Ergonomic assessments",
            "Health screenings",
            "Wellness challenges",
            "Flexible work arrangements"
          ],
          allowMultiple: true,
          required: false
        },
        {
          type: "text",
          question: "What is the biggest barrier to maintaining your wellness at work?",
          placeholder: "Please describe any challenges you face...",
          required: false
        },
        {
          type: "scale",
          question: "How supportive is your manager regarding wellness initiatives?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Not supportive",
              2: "Slightly supportive",
              3: "Moderately supportive",
              4: "Very supportive", 
              5: "Extremely supportive"
            }
          },
          required: true
        },
        {
          type: "text",
          question: "What one change would most improve wellness in your workplace?",
          placeholder: "Share your suggestion...",
          required: false
        }
      ],
      isTemplate: true
    },
    {
      title: "Mental Health & Stress Survey",
      description: "Focused assessment of mental health support needs and stress levels in the workplace.",
      type: "feedback",
      estimatedTime: 6,
      questions: [
        {
          type: "scale",
          question: "On a scale of 1-10, how would you rate your current stress level at work?",
          scale: {
            min: 1,
            max: 10,
            labels: { 1: "No stress", 5: "Moderate", 10: "Extreme stress" }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "What are your primary sources of work-related stress? (Select all that apply)",
          options: [
            "Heavy workload or unrealistic deadlines",
            "Lack of control over work decisions",
            "Unclear job expectations",
            "Difficult relationships with colleagues",
            "Poor work-life balance",
            "Job insecurity or organizational changes",
            "Insufficient resources or support",
            "Technology issues or system problems"
          ],
          allowMultiple: true,
          required: true
        },
        {
          type: "scale",
          question: "How comfortable would you feel seeking mental health support through work?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Very uncomfortable",
              2: "Uncomfortable",
              3: "Neutral",
              4: "Comfortable",
              5: "Very comfortable"
            }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "Which mental health resources would be most valuable to you?",
          options: [
            "Employee Assistance Program (EAP)",
            "On-site counseling services",
            "Mental health first aid training",
            "Stress management workshops",
            "Meditation and mindfulness programs",
            "Flexible work arrangements",
            "Mental health days/time off",
            "Peer support groups"
          ],
          allowMultiple: true,
          required: false
        },
        {
          type: "boolean",
          question: "Do you feel that mental health is treated with the same importance as physical health at your workplace?",
          required: true
        },
        {
          type: "text",
          question: "What would help you feel more mentally supported at work?",
          placeholder: "Please share your thoughts...",
          required: false
        }
      ],
      isTemplate: true
    },
    {
      title: "Work-Life Balance Assessment",
      description: "Evaluate employees' work-life balance satisfaction and identify areas for organizational improvement.",
      category: "work-environment",
      estimatedTime: 5,
      questions: [
        {
          type: "scale",
          question: "How satisfied are you with your current work-life balance?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Very dissatisfied",
              2: "Dissatisfied",
              3: "Neutral",
              4: "Satisfied",
              5: "Very satisfied"
            }
          },
          required: true
        },
        {
          type: "scale",
          question: "On average, how many hours per week do you work?",
          scale: {
            min: 20,
            max: 80,
            labels: { 20: "20 hours", 40: "40 hours", 60: "60 hours", 80: "80+ hours" }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "Which flexible work options would most improve your work-life balance?",
          options: [
            "Remote work opportunities",
            "Flexible start/end times",
            "Compressed work weeks (4x10 hours)",
            "Job sharing arrangements",
            "Unlimited PTO policy",
            "Sabbatical opportunities",
            "Part-time options",
            "Results-only work environment"
          ],
          allowMultiple: true,
          required: false
        },
        {
          type: "boolean",
          question: "Do you regularly work outside of normal business hours?",
          required: true
        },
        {
          type: "scale",
          question: "How often do you feel overwhelmed by your workload?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Never",
              2: "Rarely",
              3: "Sometimes",
              4: "Often",
              5: "Always"
            }
          },
          required: true
        },
        {
          type: "text",
          question: "What is your biggest challenge in maintaining work-life balance?",
          placeholder: "Describe your main challenge...",
          required: false
        },
        {
          type: "scale",
          question: "How supportive is your organization in helping employees achieve work-life balance?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Not supportive",
              2: "Slightly supportive",
              3: "Moderately supportive",
              4: "Very supportive",
              5: "Extremely supportive"
            }
          },
          required: true
        }
      ],
      isTemplate: true
    },
    {
      title: "Team Communication & Collaboration Survey",
      description: "Assess team dynamics, communication effectiveness, and collaboration satisfaction.",
      category: "team-dynamics",
      estimatedTime: 7,
      questions: [
        {
          type: "scale",
          question: "How would you rate the overall communication within your team?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Poor",
              2: "Fair",
              3: "Good",
              4: "Very Good",
              5: "Excellent"
            }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "Which communication methods work best for your team? (Select all that apply)",
          options: [
            "Face-to-face meetings",
            "Video conferences",
            "Email communication",
            "Instant messaging/chat",
            "Project management tools",
            "Phone calls",
            "Collaborative documents",
            "Team social channels"
          ],
          allowMultiple: true,
          required: true
        },
        {
          type: "scale",
          question: "How comfortable do you feel sharing ideas and opinions with your team?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Very uncomfortable",
              2: "Uncomfortable",
              3: "Neutral",
              4: "Comfortable",
              5: "Very comfortable"
            }
          },
          required: true
        },
        {
          type: "boolean",
          question: "Do you feel your contributions are valued by your team members?",
          required: true
        },
        {
          type: "scale",
          question: "How effectively does your team handle conflicts or disagreements?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Very poorly",
              2: "Poorly",
              3: "Adequately",
              4: "Well",
              5: "Very well"
            }
          },
          required: true
        },
        {
          type: "multiple_choice",
          question: "What would improve collaboration in your team?",
          options: [
            "More frequent team meetings",
            "Better project management tools",
            "Clearer role definitions",
            "Team building activities",
            "Improved communication training",
            "More inclusive decision-making",
            "Regular feedback sessions",
            "Shared workspace/collaboration areas"
          ],
          allowMultiple: true,
          required: false
        },
        {
          type: "text",
          question: "Describe a time when your team collaborated particularly well. What made it successful?",
          placeholder: "Share your experience...",
          required: false
        }
      ],
      isTemplate: true
    },
    {
      title: "Employee Engagement Pulse Survey",
      description: "Quick monthly pulse survey to monitor employee engagement and satisfaction trends.",
      category: "job-satisfaction",
      estimatedTime: 3,
      questions: [
        {
          type: "scale",
          question: "How engaged do you feel at work today?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Not engaged",
              2: "Slightly engaged",
              3: "Moderately engaged",
              4: "Highly engaged",
              5: "Completely engaged"
            }
          },
          required: true
        },
        {
          type: "scale",
          question: "How likely are you to recommend this company as a great place to work? (0-10)",
          scale: {
            min: 0,
            max: 10,
            labels: { 0: "Not likely", 5: "Neutral", 10: "Extremely likely" }
          },
          required: true
        },
        {
          type: "scale",
          question: "How satisfied are you with your current role?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Very dissatisfied",
              2: "Dissatisfied",
              3: "Neutral",
              4: "Satisfied",
              5: "Very satisfied"
            }
          },
          required: true
        },
        {
          type: "boolean",
          question: "Do you have the resources and support needed to do your job effectively?",
          required: true
        },
        {
          type: "scale",
          question: "How valued do you feel as an employee?",
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: "Not valued",
              2: "Slightly valued",
              3: "Moderately valued",
              4: "Highly valued",
              5: "Extremely valued"
            }
          },
          required: true
        },
        {
          type: "text",
          question: "What's one thing that would make your work experience better this month?",
          placeholder: "Share one improvement idea...",
          required: false
        }
      ],
      isTemplate: true
    }
  ];

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchQuery, selectedType, selectedStatus]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const response = await api.getSurveys();
      if (response.success) {
        setSurveys(response.data.surveys || []);
      }
    } catch (err) {
      console.error('Failed to load surveys:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchQuery.trim()) {
      filtered = filtered.filter(survey =>
        survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(survey => survey.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(survey => survey.status === selectedStatus);
    }

    setFilteredSurveys(filtered);
  };

  const handleCreateSurvey = async (surveyData) => {
    try {
      const response = await api.createSurvey(surveyData);
      if (response.success) {
        setSurveys(prev => [response.data.survey, ...prev]);
        setShowModal(false);
        toast.success('Survey created successfully!');
      }
    } catch (error) {
      console.error('Failed to create survey:', error);
      toast.error('Failed to create survey');
    }
  };

  const handleUpdateSurvey = async (surveyId, surveyData) => {
    try {
      const response = await api.updateSurvey(surveyId, surveyData);
      if (response.success) {
        setSurveys(prev => prev.map(survey => 
          survey._id === surveyId ? response.data.survey : survey
        ));
        setEditingSurvey(null);
        setShowModal(false);
        toast.success('Survey updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update survey:', error);
      toast.error('Failed to update survey');
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;

    try {
      const response = await api.deleteSurvey(surveyId);
      if (response.success) {
        setSurveys(prev => prev.filter(survey => survey._id !== surveyId));
        toast.success('Survey deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  const handleStatusChange = async (surveyId, newStatus) => {
    try {
      const response = await api.updateSurveyStatus(surveyId, newStatus);
      if (response.success) {
        setSurveys(prev => prev.map(survey => 
          survey._id === surveyId ? { ...survey, status: newStatus } : survey
        ));
        toast.success(`Survey ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update survey status');
    }
  };

  const handleUseTemplate = (template) => {
    // Remove any ID fields from template to ensure it's treated as a new item
    const { _id, id, ...templateData } = template;
    setEditingSurvey(templateData);
    setShowModal(true);
    setShowTemplates(false);
  };

  const getTypeInfo = (type) => {
    return surveyTypes.find(t => t.value === type) || { label: type, icon: '📊' };
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  const getStatusActions = (survey) => {
    const actions = [];
    
    switch (survey.status) {
      case 'draft':
        actions.push({ label: 'Activate', action: 'active', icon: PlayIcon, color: 'green' });
        break;
      case 'active':
        actions.push({ label: 'Complete', action: 'completed', icon: CheckCircleIcon, color: 'blue' });
        actions.push({ label: 'Pause', action: 'draft', icon: PauseIcon, color: 'yellow' });
        break;
      case 'completed':
        actions.push({ label: 'Archive', action: 'archived', icon: StopIcon, color: 'purple' });
        break;
    }
    
    return actions;
  };

  if (loading) {
    return <LoadingState message="Loading surveys..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load surveys"
        description={error}
        onRetry={loadSurveys}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Management"
        subtitle="Create and manage employee surveys to gather valuable feedback"
        icon={ChartBarIcon}
        iconColor="text-indigo-600"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        {/* Search and Filters */}
        <div className="flex flex-1 space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {surveyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <StarIcon className="h-5 w-5" />
            <span>Templates</span>
          </button>
          
          <button
            onClick={() => {
              setEditingSurvey(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Survey</span>
          </button>
        </div>
      </div>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSurveys.map((survey) => {
            const typeInfo = getTypeInfo(survey.type);
            const statusColor = getStatusColor(survey.status);
            const statusActions = getStatusActions(survey);
            
            return (
              <motion.div
                key={survey._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}>
                        {survey.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {statusActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleStatusChange(survey._id, action.action)}
                        className={`p-1 text-${action.color}-600 hover:bg-${action.color}-50 rounded transition-colors`}
                        title={action.label}
                      >
                        <action.icon className="h-4 w-4" />
                      </button>
                    ))}
                    {survey.status === 'active' && (
                      <button
                        onClick={() => {
                          setDistributingSurvey(survey);
                          setShowDistributionModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Distribute Survey"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingSurvey(survey);
                        setShowModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSurvey(survey._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {survey.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {survey.description}
                </p>

                {/* Survey Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      <span>{survey.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>~{survey.estimatedTime || 5} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      {survey.responses?.length || 0} responses
                    </span>
                    <div className="flex items-center space-x-1">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>{survey.completionRate || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {survey.createdAt ? 
                      new Date(survey.createdAt).toLocaleDateString() : 
                      'Just created'
                    }
                  </span>
                  <span className={`px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSurveys.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' ? 
              'No surveys found' : 'No surveys yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first employee survey to gather valuable feedback'
            }
          </p>
          {(!searchQuery && selectedType === 'all' && selectedStatus === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create First Survey
            </button>
          )}
        </motion.div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templateSurveys}
        onUseTemplate={handleUseTemplate}
      />

      {/* Survey Modal */}
      <SurveyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSurvey(null);
        }}
        survey={editingSurvey}
        surveyTypes={surveyTypes.filter(t => t.value !== 'all')}
        questionTypes={questionTypes}
        onSubmit={editingSurvey?._id ? 
          (data) => handleUpdateSurvey(editingSurvey._id, data) : 
          handleCreateSurvey
        }
      />

      {/* Distribution Modal */}
      <SurveyDistributionModal
        isOpen={showDistributionModal}
        onClose={() => {
          setShowDistributionModal(false);
          setDistributingSurvey(null);
        }}
        survey={distributingSurvey}
      />
    </div>
  );
};

// Templates Modal Component
const TemplatesModal = ({ isOpen, onClose, templates, onUseTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Survey Templates</h2>
              <p className="text-gray-600 text-sm mt-1">Choose from research-backed survey templates designed for maximum insights</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                      {template.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{template.questions.length} questions</div>
                    <div className="text-xs font-medium text-indigo-600">~{template.estimatedTime} min</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>
                
                {/* Preview questions */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Sample Questions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.questions.slice(0, 3).map((question, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-indigo-500 mr-1">•</span>
                        <span className="line-clamp-1">{question.question}</span>
                      </li>
                    ))}
                    {template.questions.length > 3 && (
                      <li className="text-xs text-gray-400">+{template.questions.length - 3} more questions</li>
                    )}
                  </ul>
                </div>
                
                <button
                  onClick={() => onUseTemplate(template)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Use This Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Survey Modal Component
const SurveyModal = ({ isOpen, onClose, survey, surveyTypes, questionTypes, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pulse',
    estimatedTime: 5,
    questions: [{ type: 'scale', question: '', options: [], required: true, scale: { min: 1, max: 5, labels: {} } }],
    isAnonymous: true,
    isActive: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (survey) {
      setFormData({
        title: survey.title || '',
        description: survey.description || '',
        type: survey.type || 'pulse',
        estimatedTime: survey.estimatedTime || 5,
        questions: survey.questions || [{ type: 'scale', question: '', options: [], required: true, scale: { min: 1, max: 5, labels: {} } }],
        isAnonymous: survey.isAnonymous !== undefined ? survey.isAnonymous : true,
        isActive: survey.isActive !== undefined ? survey.isActive : false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'pulse',
        estimatedTime: 5,
        questions: [{ type: 'scale', question: '', options: [], required: true, scale: { min: 1, max: 5, labels: {} } }],
        isAnonymous: true,
        isActive: false
      });
    }
  }, [survey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        questions: formData.questions.map((q, index) => {
          const questionData = {
            id: `q${index + 1}`,
            question: q.question,
            type: q.type,
            required: q.required || false
          };
          
          // Add options for multiple choice questions
          if (q.type === 'multiple_choice' || q.type === 'multiple-choice') {
            questionData.options = q.options || [];
            console.log(`🔍 SURVEY CREATION - Question ${index + 1} (${q.type}) options:`, questionData.options);
          }
          
          // Add scale for scale questions
          if (q.type === 'scale') {
            questionData.scale = q.scale;
            console.log(`🔍 SURVEY CREATION - Question ${index + 1} (${q.type}) scale:`, questionData.scale);
          }
          
          return questionData;
        }),
        schedule: {
          frequency: 'once',
          startDate: new Date().toISOString()
        },
        status: formData.isActive ? 'active' : 'draft'
      };
      
      console.log('🔍 SURVEY CREATION - Full submit data:', submitData);
      
      await onSubmit(submitData);
      
      // Reset form if creating new survey
      if (!survey) {
        setFormData({
          title: '',
          description: '',
          type: 'pulse',
          estimatedTime: 5,
          questions: [{ type: 'scale', question: '', options: [], required: true, scale: { min: 1, max: 5, labels: {} } }],
          isAnonymous: true,
          isActive: false
        });
      }
    } catch (error) {
      console.error('Failed to submit survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        type: 'scale', 
        question: '', 
        options: [], 
        required: true,
        scale: {
          min: 1,
          max: 5,
          labels: {}
        }
      }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, [field]: value };
          
          // If changing to scale type, ensure scale object exists
          if (field === 'type' && value === 'scale' && !updatedQuestion.scale) {
            updatedQuestion.scale = {
              min: 1,
              max: 5,
              labels: {}
            };
          }
          
          return updatedQuestion;
        }
        return q;
      })
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {survey ? 'Edit Survey' : 'Create New Survey'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Employee Wellness Assessment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 5 }))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this survey..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {surveyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>

              {/* Settings */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                    Anonymous responses
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (visible to employees)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={question.required}
                        onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">
                        Required question
                      </label>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Enter your question..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Options for multiple choice questions */}
                  {(question.type === 'multiple_choice' || question.type === 'multiple-choice' || question.type === 'rating-scale') && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={question.options?.join('\n') || ''}
                        onChange={(e) => updateQuestion(index, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                        placeholder={(question.type === 'rating-scale' || question.type === 'scale') ? 
                          "Poor\nFair\nGood\nVery Good\nExcellent" : 
                          "Option 1\nOption 2\nOption 3"
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (survey ? 'Update Survey' : 'Create Survey')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SurveyManagement;