import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  BookmarkIcon,
  ShareIcon,
  ThumbsUp,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  StarIcon,
  DownloadIcon,
  PlayIcon,
  PauseIcon,
  ExternalLinkIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../store/authStore';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

const ResourceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [userInteraction, setUserInteraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [calculatedReadingTime, setCalculatedReadingTime] = useState(null);
  const [viewTracked, setViewTracked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  // Calculate accurate reading time based on content
  const calculateReadingTime = (content) => {
    if (!content) return 5; // Default fallback
    
    // Remove markdown formatting and count words
    const plainText = content.replace(/[#*_`\[\]()]/g, '').replace(/\n+/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).length;
    
    // Average reading speed: 200-250 words per minute (using 220)
    const averageWordsPerMinute = 220;
    const readingTimeMinutes = Math.ceil(wordCount / averageWordsPerMinute);
    
    // Minimum 1 minute, maximum 60 minutes
    return Math.max(1, Math.min(60, readingTimeMinutes));
  };

  useEffect(() => {
    if (id) {
      // Reset tracking state for new resource
      setViewTracked(false);
      setResource(null);
      setError(null);
      setIsFavorite(false); // Reset favorite state
      setUserInteraction(null); // Reset user interaction
      setIsCompleted(false); // Reset completion state
      
      loadResource();
      setStartTime(Date.now());

      // Track reading time
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Update every minute

      // Track scroll progress
      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        setReadingProgress(Math.min(scrollPercent, 100));

        // Auto-complete if user scrolls to 90%
        if (scrollPercent >= 90 && !isCompleted) {
          handleCompleteResource();
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        clearInterval(interval);
        window.removeEventListener('scroll', handleScroll);
        
        // Track final progress on unmount
        if (startTime && readingProgress > 0) {
          updateProgress();
        }
      };
    }
  }, [id]); // Only re-run when ID changes

  const loadResource = async () => {
    // Prevent duplicate loading
    if (viewTracked) return;
    
    try {
      setLoading(true);
      const response = await api.request(`/resources/${id}`);
      
      if (response.success) {
        const resourceData = response.data.resource;
        setResource(resourceData);
        setUserInteraction(response.data.userInteraction);
        
        // Calculate accurate reading time based on content
        const contentText = resourceData.content?.body || resourceData.content || '';
        const accurateReadingTime = calculateReadingTime(contentText);
        setCalculatedReadingTime(accurateReadingTime);
        
        if (response.data.userInteraction?.interactions?.completed) {
          setIsCompleted(true);
        }
        
        // Set favorite status
        const bookmarked = response.data.userInteraction?.interactions?.bookmarked || false;
        setIsFavorite(bookmarked);
        
        // Mark view as tracked to prevent duplicates
        setViewTracked(true);
      } else {
        console.error('API response not successful:', response);
        setError(response.message || 'Failed to load resource');
      }
    } catch (err) {
      console.error('Failed to load resource:', err);
      setError(err.message || 'Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    if (!resource) return;

    try {
      const currentTime = Date.now();
      const sessionTime = startTime ? Math.floor((currentTime - startTime) / 60000) : 0;
      
      await api.trackResourceInteraction(resource._id, 'update_progress', {
        percentage: readingProgress,
        timeSpent: timeSpent + sessionTime
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleCompleteResource = async () => {
    if (isCompleted || !resource) return;

    try {
      const currentTime = Date.now();
      const sessionTime = startTime ? Math.floor((currentTime - startTime) / 60000) : 0;
      
      await api.trackResourceInteraction(resource._id, 'complete', {
        timeSpent: timeSpent + sessionTime
      });
      
      setIsCompleted(true);
      toast.success('Resource completed! Great job! 🎉');
      
      // Update local state
      setUserInteraction(prev => ({
        ...prev,
        interactions: {
          ...prev?.interactions,
          completed: true
        },
        completedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to complete resource:', error);
      toast.error('Failed to mark resource as complete');
    }
  };

  const handleLikeResource = async () => {
    try {
      await api.trackResourceInteraction(resource._id, 'like');
      
      const wasLiked = userInteraction?.interactions?.liked;
      setUserInteraction(prev => ({
        ...prev,
        interactions: {
          ...prev?.interactions,
          liked: !wasLiked
        }
      }));

      // Update resource analytics locally
      setResource(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          likes: prev.analytics.likes + (wasLiked ? -1 : 1)
        }
      }));

      toast.success(wasLiked ? 'Like removed' : 'Resource liked! 👍');
    } catch (error) {
      console.error('Failed to like resource:', error);
      toast.error('Failed to like resource');
    }
  };

  const handleBookmarkResource = async () => {
    try {
      const wasBookmarked = isFavorite;
      
      if (wasBookmarked) {
        await api.removeFromFavorites(resource._id);
        setIsFavorite(false);
      } else {
        await api.addToFavorites(resource._id);
        setIsFavorite(true);
      }
      
      setUserInteraction(prev => ({
        ...prev,
        interactions: {
          ...prev?.interactions,
          bookmarked: !wasBookmarked
        }
      }));

      toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks! 📖');
    } catch (error) {
      console.error('Failed to bookmark resource:', error);
      toast.error('Failed to bookmark resource');
    }
  };

  const handleShareResource = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard! 📋');
      }
      
      await api.trackResourceInteraction(resource._id, 'share');
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleDownloadResource = async () => {
    try {
      await api.trackResourceInteraction(resource._id, 'download');
      
      // Update resource analytics locally
      setResource(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          downloads: prev.analytics.downloads + 1
        }
      }));

      toast.success('Download tracked! 📥');
    } catch (error) {
      console.error('Failed to track download:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'audio': return PlayIcon;
      case 'article': return BookmarkIcon;
      case 'guide': return BookmarkIcon;
      default: return BookmarkIcon;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <LoadingState message="Loading resource..." />;
  }

  if (error || !resource) {
    return (
      <ErrorState 
        message="Failed to load resource"
        description={error}
        onRetry={loadResource}
      />
    );
  }

  const TypeIcon = getTypeIcon(resource.type);
  const isBookmarked = isFavorite;
  const isLiked = userInteraction?.interactions?.liked;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg sticky top-4 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/employee/resources')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon size={20} />
                <span>Back to Resources</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleBookmarkResource}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookmarkIcon size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleLikeResource}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">Like</span>
              </button>

              <button
                onClick={handleShareResource}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ShareIcon size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>

              {!isCompleted && (
                <button
                  onClick={handleCompleteResource}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircleIcon size={18} />
                  <span className="hidden sm:inline">Mark Complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-sage-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Resource Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-sage-100 rounded-xl">
              <TypeIcon className="h-8 w-8 text-sage-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                  {resource.type}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {resource.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {resource.difficulty}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center">
                    <CheckCircleIcon size={14} className="mr-1" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{resource.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{resource.description}</p>
            </div>
          </div>

          {/* Resource Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <UserIcon size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-semibold text-gray-900">
                  {resource.author?.name || resource.createdBy?.name || 'Wellness Team'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ClockIcon size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Reading Time</p>
                <p className="font-semibold text-gray-900">
                  {formatDuration(calculatedReadingTime || resource.readingTime || 5)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CalendarIcon size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="font-semibold text-gray-900">
                  {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <EyeIcon size={18} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Views</p>
                <p className="font-semibold text-gray-900">{resource.analytics?.views || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            {resource.content?.url ? (
              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <ExternalLinkIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">External Resource</h3>
                  <p className="text-gray-600 mb-4">This resource is hosted externally. Click below to access it.</p>
                  <a
                    href={resource.content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDownloadResource}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLinkIcon size={18} />
                    <span>Access Resource</span>
                  </a>
                </div>
              </div>
            ) : null}

            {(resource.content?.body || resource.content) ? (
              <div className="mb-8 markdown-content">
                <ReactMarkdown>
                  {resource.content?.body || resource.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Not Available</h3>
                  <p className="text-gray-600 mb-4">
                    The content for this resource is not available or hasn't been properly configured.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please contact your administrator to update this resource content.
                  </p>
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {resource.learningObjectives && resource.learningObjectives.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon size={20} className="text-green-500 mr-2" />
                  What You'll Learn
                </h3>
                <ul className="space-y-3">
                  {resource.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-sage-500 mt-0.5">•</span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {resource.prerequisites && resource.prerequisites.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {resource.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-orange-500 mt-0.5">→</span>
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics Covered</h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-sage-100 text-sage-700 font-medium"
                >
                  <TagIcon size={14} className="mr-1.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resource Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resource.analytics?.views || 0}</div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{resource.analytics?.likes || 0}</div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resource.analytics?.completions || 0}</div>
              <div className="text-sm text-gray-500">Completions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {resource.analytics?.averageRating ? resource.analytics.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceView;