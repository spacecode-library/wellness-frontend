import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus as PlusIcon, 
  Search as MagnifyingGlassIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  Flame as FireIcon,
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Trophy as TrophyIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as StopIcon,
  Star as StarIcon,
  Clock as ClockIcon,
  Flag as FlagIcon
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🎯' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'habit', label: 'Habit', icon: '🔄' },
    { value: 'team', label: 'Team', icon: '👥' }
  ];

  const challengeTypes = [
    { value: 'individual', label: 'Individual', icon: '👤' },
    { value: 'team', label: 'Team', icon: '👥' },
    { value: 'company_wide', label: 'Company Wide', icon: '🏢' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'upcoming', label: 'Upcoming', color: 'blue' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'purple' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  // Template challenges with engaging, research-backed content
  const templateChallenges = [
    {
      title: "21-Day Mindful Morning Routine",
      description: "Start each day with intention and focus. Build a sustainable morning routine that sets you up for success.",
      category: "mindfulness",
      type: "individual",
      duration: 21,
      points: 210,
      difficulty: "beginner",
      requirements: [
        "5 minutes of deep breathing or meditation",
        "Write down 3 daily priorities",
        "Express gratitude for one thing",
        "No phone for first 30 minutes after waking"
      ],
      tips: [
        "Start with just 2-3 minutes of breathing if new to meditation",
        "Prepare priorities the night before if mornings are rushed",
        "Use a physical notebook instead of phone for gratitude",
        "Put phone in another room or use airplane mode"
      ],
      benefits: [
        "23% improvement in focus and concentration",
        "Reduced morning anxiety and stress",
        "Better decision-making throughout the day",
        "Increased sense of control and intentionality"
      ],
      dailyActions: ["Complete morning breathing exercise", "Set 3 daily priorities", "Write gratitude note", "Phone-free morning"],
      isTemplate: true
    },
    {
      title: "10,000 Steps Squad Challenge",
      description: "Team-based walking challenge to promote physical activity and friendly competition while building connections.",
      category: "fitness",
      type: "team",
      duration: 30,
      points: 300,
      difficulty: "beginner",
      requirements: [
        "Walk at least 10,000 steps daily",
        "Log steps in team tracker",
        "Encourage team members weekly",
        "Share one walking photo per week"
      ],
      tips: [
        "Take walking meetings when possible",
        "Park farther away or get off transit one stop early",
        "Use stairs instead of elevators",
        "Take short walking breaks every 2 hours",
        "Walk during phone calls when appropriate"
      ],
      benefits: [
        "Improved cardiovascular health",
        "Increased energy levels throughout day",
        "Better mood and reduced stress",
        "Stronger team relationships",
        "Enhanced creativity from movement"
      ],
      teamFeatures: {
        maxTeamSize: 8,
        allowTeamChat: true,
        trackTeamProgress: true,
        teamRewards: true
      },
      milestones: [
        { day: 7, reward: "Team badge: Week 1 Warriors", points: 50 },
        { day: 14, reward: "Team badge: Halfway Heroes", points: 75 },
        { day: 21, reward: "Team badge: Three Week Trekkers", points: 100 },
        { day: 30, reward: "Team badge: Step Masters", points: 150 }
      ],
      isTemplate: true
    },
    {
      title: "Hydration Hero Challenge",
      description: "Build the habit of proper hydration for better energy, focus, and overall health.",
      category: "nutrition",
      type: "individual",
      duration: 14,
      points: 140,
      difficulty: "beginner",
      requirements: [
        "Drink 8 glasses of water daily (64 oz)",
        "Track water intake",
        "Start day with 16 oz of water",
        "No sugary drinks during challenge period"
      ],
      tips: [
        "Use a marked water bottle to track intake",
        "Set hourly reminders on phone",
        "Drink a glass before each meal",
        "Add lemon, cucumber, or mint for variety",
        "Keep water visible on your desk"
      ],
      benefits: [
        "Increased energy and alertness",
        "Better skin health and appearance",
        "Improved digestion and metabolism",
        "Enhanced cognitive function",
        "Reduced headaches and fatigue"
      ],
      science: "Proper hydration increases brain performance by 12% and can improve mood within 15 minutes of drinking water.",
      dailyActions: ["Morning water (16 oz)", "Track intake hourly", "Pre-meal hydration", "Evening reflection"],
      isTemplate: true
    },
    {
      title: "Digital Sunset Challenge",
      description: "Improve sleep quality and evening relaxation by creating healthy technology boundaries.",
      category: "sleep",
      type: "individual",
      duration: 14,
      points: 140,
      difficulty: "intermediate",
      requirements: [
        "No screens 1 hour before bedtime",
        "Create a relaxing evening routine",
        "Keep bedroom device-free",
        "Use analog alarm clock instead of phone"
      ],
      tips: [
        "Set up charging station outside bedroom",
        "Use blue light filters on devices after sunset",
        "Try reading, journaling, or light stretching instead",
        "Inform family/friends about your digital sunset time",
        "Use 'Do Not Disturb' mode liberally"
      ],
      benefits: [
        "Fall asleep 37% faster on average",
        "Deeper, more restorative sleep cycles",
        "Reduced eye strain and headaches",
        "Better morning mood and energy",
        "Improved melatonin production"
      ],
      alternatives: [
        "Reading physical books or magazines",
        "Gentle yoga or stretching",
        "Meditation or breathing exercises",
        "Journaling or planning tomorrow",
        "Conversation with family/roommates",
        "Crafts, drawing, or puzzles"
      ],
      isTemplate: true
    },
    {
      title: "Random Acts of Kindness Week",
      description: "Boost workplace morale and personal well-being through intentional acts of kindness and connection.",
      category: "social",
      type: "individual",
      duration: 7,
      points: 105,
      difficulty: "beginner",
      requirements: [
        "Perform one act of kindness daily",
        "Document the act (without naming recipients)",
        "Notice and appreciate kindness from others",
        "Share one story of kindness witnessed"
      ],
      kindnessIdeas: [
        "Bring coffee/tea for a colleague",
        "Write a thank-you note to someone",
        "Help with a task without being asked",
        "Give a genuine compliment",
        "Listen fully when someone needs to talk",
        "Share useful resources or information",
        "Offer to cover for someone having a tough day",
        "Celebrate someone's achievement publicly"
      ],
      benefits: [
        "Increased happiness and life satisfaction",
        "Reduced stress and anxiety levels",
        "Stronger workplace relationships",
        "Enhanced sense of purpose and meaning",
        "Improved team culture and morale"
      ],
      science: "Acts of kindness release oxytocin, reduce cortisol by 23%, and can increase happiness for up to 8 weeks.",
      reflectionPrompts: [
        "How did giving kindness make you feel?",
        "What kindness did you notice from others?",
        "How has your perspective on work relationships changed?",
        "What small kindnesses had the biggest impact?"
      ],
      isTemplate: true
    },
    {
      title: "Skill-Building Sprint",
      description: "Dedicate time daily to learning a new professional or personal skill through focused practice.",
      category: "learning",
      type: "individual",
      duration: 21,
      points: 315,
      difficulty: "intermediate",
      requirements: [
        "Practice chosen skill for 30 minutes daily",
        "Document progress and insights",
        "Apply learning in real work situation",
        "Share one key insight with team weekly"
      ],
      skillSuggestions: [
        "Public speaking and presentation skills",
        "Data analysis and visualization",
        "Creative writing and communication",
        "Project management techniques",
        "Emotional intelligence and empathy",
        "Time management and productivity",
        "Leadership and delegation",
        "Active listening and feedback",
        "Problem-solving frameworks",
        "Digital tools and automation"
      ],
      learningMethods: [
        "Online courses (15-20 minutes)",
        "Podcast episodes during commute",
        "YouTube tutorials with practice",
        "Reading articles and taking notes",
        "Practicing with colleagues or friends",
        "Joining online communities",
        "Teaching concept to someone else"
      ],
      benefits: [
        "Enhanced career prospects and opportunities",
        "Increased confidence and self-efficacy",
        "Greater job satisfaction and engagement",
        "Improved problem-solving abilities",
        "Expanded professional network"
      ],
      milestones: [
        { day: 7, task: "Complete foundational learning", points: 50 },
        { day: 14, task: "Apply skill in work context", points: 75 },
        { day: 21, task: "Teach or share with others", points: 100 }
      ],
      isTemplate: true
    },
    {
      title: "Lunch Break Liberation",
      description: "Reclaim your lunch break for restoration, connection, and activities that energize you for the afternoon.",
      category: "productivity",
      type: "individual",
      duration: 10,
      points: 100,
      difficulty: "beginner",
      requirements: [
        "Take a full 30-60 minute lunch break daily",
        "Step away from your workspace",
        "Engage in restorative activity",
        "No work-related tasks during lunch"
      ],
      lunchActivities: [
        "Take a walk outside (even 10 minutes helps)",
        "Have lunch with a colleague or friend",
        "Read a book or listen to a podcast",
        "Practice mindfulness or meditation",
        "Do light stretching or yoga",
        "Call a family member or friend",
        "Pursue a hobby (drawing, music, writing)",
        "Explore your neighborhood or building"
      ],
      benefits: [
        "40% better afternoon focus and concentration",
        "Reduced burnout and workplace stress",
        "Improved creativity and problem-solving",
        "Better work-life boundaries",
        "Enhanced social connections"
      ],
      tips: [
        "Block lunch time in your calendar",
        "Turn off work notifications",
        "Find a lunch buddy for accountability",
        "Prepare lunch the night before to save time",
        "Explore different spaces in your building/area"
      ],
      science: "Taking breaks reduces decision fatigue by 65% and improves afternoon performance by 23%.",
      isTemplate: true
    }
  ];

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, searchQuery, selectedCategory, selectedStatus]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.getChallenges();
      if (response.success) {
        setChallenges(response.data.challenges || []);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = challenges;

    if (searchQuery.trim()) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(challenge => challenge.status === selectedStatus);
    }

    setFilteredChallenges(filtered);
  };

  const handleCreateChallenge = async (challengeData) => {
    try {
      const response = await api.createChallenge(challengeData);
      if (response.success) {
        setChallenges(prev => [response.data.challenge, ...prev]);
        setShowModal(false);
        toast.success('Challenge created successfully!');
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast.error(error.message || 'Failed to create challenge');
    }
  };

  const handleUpdateChallenge = async (challengeId, challengeData) => {
    try {
      const response = await api.updateChallenge(challengeId, challengeData);
      if (response.success) {
        setChallenges(prev => prev.map(challenge => 
          challenge._id === challengeId ? response.data.challenge : challenge
        ));
        setEditingChallenge(null);
        setShowModal(false);
        toast.success('Challenge updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update challenge:', error);
      toast.error(error.message || 'Failed to update challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const response = await api.deleteChallenge(challengeId);
      if (response.success) {
        setChallenges(prev => prev.filter(challenge => challenge._id !== challengeId));
        toast.success('Challenge deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  const handleStatusChange = async (challengeId, newStatus) => {
    try {
      const response = await api.updateChallengeStatus(challengeId, newStatus);
      if (response.success) {
        setChallenges(prev => prev.map(challenge => 
          challenge._id === challengeId ? { ...challenge, status: newStatus } : challenge
        ));
        toast.success(`Challenge ${newStatus} successfully`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update challenge status');
    }
  };

  const handleUseTemplate = (template) => {
    // Remove any ID fields from template to ensure it's treated as a new item
    const { _id, id, ...templateData } = template;
    setEditingChallenge(templateData);
    setShowModal(true);
    setShowTemplates(false);
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || { label: category, icon: '🎯' };
  };

  const getStatusColor = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  const getStatusActions = (challenge) => {
    const actions = [];
    
    switch (challenge.status) {
      case 'draft':
        actions.push({ label: 'Publish', action: 'active', icon: PlayIcon, color: 'green' });
        break;
      case 'active':
        actions.push({ label: 'Complete', action: 'completed', icon: FlagIcon, color: 'purple' });
        actions.push({ label: 'Cancel', action: 'cancelled', icon: StopIcon, color: 'red' });
        break;
      case 'upcoming':
        actions.push({ label: 'Start', action: 'active', icon: PlayIcon, color: 'green' });
        actions.push({ label: 'Cancel', action: 'cancelled', icon: StopIcon, color: 'red' });
        break;
    }
    
    return actions;
  };

  if (loading) {
    return <LoadingState message="Loading challenges..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load challenges"
        description={error}
        onRetry={loadChallenges}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenge Management"
        subtitle="Create and manage wellness challenges to engage your team"
        icon={FireIcon}
        iconColor="text-green-600"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        {/* Search and Filters */}
        <div className="flex flex-1 space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              setEditingChallenge(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Challenge</span>
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredChallenges.map((challenge) => {
            const categoryInfo = getCategoryInfo(challenge.category);
            const statusColor = getStatusColor(challenge.status);
            const statusActions = getStatusActions(challenge);
            
            return (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{categoryInfo.icon}</span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {statusActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleStatusChange(challenge._id, action.action)}
                        className={`p-1 text-${action.color}-600 hover:bg-${action.color}-50 rounded transition-colors`}
                        title={action.label}
                      >
                        <action.icon className="h-4 w-4" />
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setEditingChallenge(challenge);
                        setShowModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChallenge(challenge._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                {/* Challenge Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{challenge.duration?.days || challenge.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrophyIcon className="h-4 w-4" />
                      <span>{challenge.points} points</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{challenge.type} challenge</span>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-4 w-4" />
                      <span>{challenge.participants?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {challenge.startDate ? 
                      new Date(challenge.startDate).toLocaleDateString() : 
                      'Not scheduled'
                    }
                  </span>
                  <span className={`px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                    {categoryInfo.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FireIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' ? 
              'No challenges found' : 'No challenges yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first wellness challenge to engage your team'
            }
          </p>
          {(!searchQuery && selectedCategory === 'all' && selectedStatus === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Challenge
            </button>
          )}
        </motion.div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templateChallenges}
        onUseTemplate={handleUseTemplate}
      />

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingChallenge(null);
        }}
        challenge={editingChallenge}
        categories={categories.filter(c => c.value !== 'all')}
        challengeTypes={challengeTypes}
        onSubmit={editingChallenge?._id ? 
          (data) => handleUpdateChallenge(editingChallenge._id, data) : 
          handleCreateChallenge
        }
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
              <h2 className="text-xl font-semibold text-gray-900">Challenge Templates</h2>
              <p className="text-gray-600 text-sm mt-1">Choose from proven wellness challenges designed for maximum engagement</p>
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
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {template.category.replace('_', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {template.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{template.duration} days</div>
                    <div className="text-xs font-medium text-green-600">{template.points} points</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>
                
                {/* Preview benefits */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Key Benefits:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-1">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {template.difficulty}
                  </span>
                  
                  <button
                    onClick={() => onUseTemplate(template)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Challenge Modal Component
const ChallengeModal = ({ isOpen, onClose, challenge, categories, challengeTypes, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mindfulness',
    type: 'individual',
    duration: 7,
    points: 70,
    difficulty: 'beginner',
    startDate: '',
    endDate: '',
    requirements: [''],
    tips: [''],
    benefits: [''],
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        category: challenge.category || 'mindfulness',
        type: challenge.type || 'individual',
        duration: challenge.duration || 7,
        points: challenge.points || 70,
        difficulty: challenge.difficulty || 'beginner',
        startDate: challenge.startDate ? challenge.startDate.split('T')[0] : '',
        endDate: challenge.endDate ? challenge.endDate.split('T')[0] : '',
        requirements: challenge.requirements || [''],
        tips: challenge.tips || [''],
        benefits: challenge.benefits || [''],
        isActive: challenge.isActive !== undefined ? challenge.isActive : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'fitness',
        type: 'habit',
        duration: 7,
        points: 70,
        difficulty: 'beginner',
        startDate: '',
        endDate: '',
        requirements: [''],
        tips: [''],
        benefits: [''],
        isActive: true
      });
    }
  }, [challenge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    // Calculate dates using same logic as backend
    // If no start date provided, start tomorrow to make it joinable
    const startDate = formData.startDate ? 
      new Date(formData.startDate) : 
      new Date(Date.now() + (24 * 60 * 60 * 1000)); // Tomorrow
    const endDate = new Date(startDate.getTime() + (formData.duration * 24 * 60 * 60 * 1000));
    
    // Validate using backend's exact calculation
    const actualDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (actualDays !== formData.duration) {
      toast.error(`Duration validation error: Expected ${formData.duration} days, but calculated ${actualDays} days. Please adjust the duration or dates.`);
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        difficulty: formData.difficulty,
        duration: {
          days: formData.duration,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        goal: {
          type: 'checkin_streak',
          target: formData.duration,
          unit: 'days',
          description: 'Complete daily challenge requirements'
        },
        rules: formData.requirements.filter(req => req.trim()),
        rewards: {
          completion: {
            happyCoins: formData.points,
            badge: `${formData.title} Champion`
          }
        },
        status: startDate > new Date() ? 'upcoming' : 'active'
      };
      
      await onSubmit(submitData);
      
      // Reset form if creating new challenge
      if (!challenge) {
        setFormData({
          title: '',
          description: '',
          category: 'mindfulness',
          type: 'individual',
          duration: 7,
          points: 70,
          difficulty: 'beginner',
          startDate: '',
          endDate: '',
          requirements: [''],
          tips: [''],
          benefits: [''],
          isActive: true
        });
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
              {challenge ? 'Edit Challenge' : 'Create New Challenge'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., 21-Day Mindful Morning Routine"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {challengeTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => {
                  const duration = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    duration,
                    points: duration * 10 // Auto-calculate points
                  }));
                }}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Reward *
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this challenge is about and why employees should participate..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Dynamic Array Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                    placeholder="e.g., 5 minutes of meditation daily"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('requirements', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('requirements')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + Add Requirement
              </button>
            </div>

            {/* Tips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tips for Success
              </label>
              {formData.tips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => updateArrayField('tips', index, e.target.value)}
                    placeholder="e.g., Start with just 2 minutes if new to meditation"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {formData.tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('tips', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('tips')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + Add Tip
              </button>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                    placeholder="e.g., Improved focus and concentration"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('benefits', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('benefits')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + Add Benefit
              </button>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible to employees)
            </label>
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (challenge ? 'Update Challenge' : 'Create Challenge')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChallengeManagement;