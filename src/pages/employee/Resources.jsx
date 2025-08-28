import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  PlayIcon, 
  FileTextIcon, 
  LinkIcon,
  SearchIcon,
  FilterIcon,
  HeartIcon,
  BrainIcon,
  ActivityIcon,
  UsersIcon,
  ChevronRightIcon,
  ClockIcon,
  StarIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  DownloadIcon,
  TagIcon,
  ShareIcon,
  CheckCircleIcon,
  EyeIcon,
  ThumbsUp,
  CalendarIcon,
  UserIcon,
  Globe2Icon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function Resources() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [favoriteResources, setFavoriteResources] = useState(new Set());
  const [userInteractions, setUserInteractions] = useState({});

  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const resourceTypes = [
    { value: 'article', label: 'Articles', icon: FileTextIcon },
    { value: 'video', label: 'Videos', icon: PlayIcon },
    { value: 'guide', label: 'Guides', icon: BookOpenIcon },
    { value: 'tool', label: 'Tools', icon: LinkIcon }
  ];

  useEffect(() => {
    loadCategories();
    loadResources();
    loadUserFavorites();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const loadCategories = async () => {
    try {
      const response = await api.getResourceCategories();
      if (response.success && response.data.categories) {
        setCategories(response.data.categories);
      } else {
        // Fallback categories if API call fails
        const fallbackCategories = [
          {
            _id: '1',
            name: 'Mental Health',
            description: 'Resources for mental wellness and stress management',
            icon: 'brain',
            resourceCount: 0,
            color: 'purple'
          },
          {
            _id: '2',
            name: 'Physical Wellness',
            description: 'Exercise routines, nutrition, and physical health',
            icon: 'activity',
            resourceCount: 0,
            color: 'blue'
          },
          {
            _id: '3',
            name: 'Work-Life Balance',
            description: 'Tips for managing work stress and personal time',
            icon: 'heart',
            resourceCount: 0,
            color: 'green'
          },
          {
            _id: '4',
            name: 'Team Building',
            description: 'Resources for better team collaboration',
            icon: 'users',
            resourceCount: 0,
            color: 'orange'
          }
        ];
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await api.getResources();
      if (response.success && response.data.resources) {
        setResources(response.data.resources);
      } else {
        // If no resources found, set empty array
        setResources([]);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    try {
      const response = await api.getUserFavorites();
      if (response.success && response.data.favorites) {
        const favoriteIds = new Set(response.data.favorites.map(fav => {
          // fav is a ResourceInteraction object with populated resourceId
          const resourceId = fav.resourceId?._id || fav.resourceId;
          return resourceId;
        }).filter(Boolean)); // Remove any null/undefined values
        setFavoriteResources(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading user favorites:', error);
      // Don't show error toast for favorites as it's not critical
    }
  };

  const filterResources = () => {
    let filtered = resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (resource.tags && Array.isArray(resource.tags) && resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesCategory = !selectedCategory || resource.category === selectedCategory;
      const matchesType = !selectedType || resource.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    setFilteredResources(filtered);
  };

  const handleResourceClick = (resource) => {
    navigate(`/employee/resources/${resource._id}`);
  };


  const handleLikeResource = async (resourceId) => {
    try {
      await api.trackResourceInteraction(resourceId, 'like');
      setUserInteractions(prev => ({
        ...prev,
        [resourceId]: {
          ...prev[resourceId],
          liked: !prev[resourceId]?.liked
        }
      }));
      toast.success(userInteractions[resourceId]?.liked ? 'Like removed' : 'Resource liked!');
    } catch (error) {
      console.error('Error liking resource:', error);
      toast.error('Failed to like resource');
    }
  };

  const handleShareResource = async (resource) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href
        });
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
      
      await api.trackResourceInteraction(resource._id, 'share');
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const toggleFavorite = async (resourceId) => {
    try {
      const isFavorite = favoriteResources.has(resourceId);
      const newFavorites = new Set(favoriteResources);
      
      if (isFavorite) {
        newFavorites.delete(resourceId);
        await api.removeFromFavorites(resourceId);
        toast.success('Removed from favorites', 'Success');
      } else {
        newFavorites.add(resourceId);
        await api.addToFavorites(resourceId);
        toast.success('Added to favorites', 'Success');
      }
      
      setFavoriteResources(newFavorites);
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites', 'Error');
      
      // Revert the optimistic update on error
      // No need to revert as we update state after successful API call
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'brain': return BrainIcon;
      case 'activity': return ActivityIcon;
      case 'heart': return HeartIcon;
      case 'users': return UsersIcon;
      default: return BookOpenIcon;
    }
  };

  const getCategoryColor = (color) => {
    switch (color) {
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = resourceTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FileTextIcon;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <PageHeader
        title="Wellness Resources"
        subtitle="Discover articles, videos, guides, and tools to support your wellbeing"
        icon={BookOpenIcon}
      />

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const CategoryIcon = getCategoryIcon(category.icon);
          return (
            <motion.div
              key={category._id || category.id}
              className="card-glass hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              whileHover={{ y: -2 }}
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getCategoryColor(category.color)}`}>
                    <CategoryIcon size={24} />
                  </div>
                  <ChevronRightIcon size={20} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="text-sm text-gray-500">
                  {category.resourceCount} resources
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card-glass">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-primary"
            >
              <option key="all-categories" value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id || category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-primary"
            >
              <option key="all-types" value="">All Types</option>
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-6">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              const isFavorite = favoriteResources.has(resource._id);
              
              return (
                <motion.div
                  key={resource._id}
                  className="card-glass hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
                  whileHover={{ y: -4 }}
                  onClick={() => handleResourceClick(resource)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-sage-100 rounded-lg">
                          <TypeIcon size={20} className="text-sage-600" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-sage-600 uppercase tracking-wide">
                            {resource.type}
                          </span>
                          <div className="text-xs text-gray-500">{resource.category}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(resource._id);
                          }}
                          className={`p-1 rounded-full transition-colors ${
                            isFavorite 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <BookmarkIcon size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        
                        {resource.isExternal && (
                          <ExternalLinkIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon size={14} className="mr-1" />
                          {resource.duration || '5 min'}
                        </div>
                        <div className="flex items-center">
                          <StarIcon size={14} className="mr-1" />
                          {resource.rating || '4.5'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        by {resource.author || 'Wellness Team'}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {resource.tags && resource.tags.length > 0 ? (
                          <>
                            {resource.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                              >
                                <TagIcon size={10} className="mr-1" />
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{resource.tags.length - 2}
                              </span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 group-hover:bg-sage-50 transition-colors">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center text-sage-600 group-hover:text-sage-700">
                        <span className="mr-2">View Resource</span>
                        <ChevronRightIcon size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="card-glass text-center py-12">
            <BookOpenIcon size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory || selectedType
                ? 'Try adjusting your filters to find more resources.'
                : 'Resources will appear here once they are added by administrators.'
              }
            </p>
            {(searchTerm || selectedCategory || selectedType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedType('');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="card-glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Library Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resources.length}</div>
              <div className="text-sm text-gray-500">Total Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resources.filter(r => r.type === 'article').length}
              </div>
              <div className="text-sm text-gray-500">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {resources.filter(r => r.type === 'video').length}
              </div>
              <div className="text-sm text-gray-500">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {favoriteResources.size}
              </div>
              <div className="text-sm text-gray-500">Your Favorites</div>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

export default Resources;