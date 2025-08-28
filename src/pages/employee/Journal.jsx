import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search,
  Pencil,
  Trash2,
  Heart,
  Sparkles,
  BookOpen,
  Calendar,
  TrendingUp,
  ChevronDown,
  Lightbulb,
  Star
} from 'lucide-react';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'reflection',
    mood: 3,
    tags: '',
    privacy: 'private'
  });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();
  const contentRef = useRef(null);
  const newEntryRef = useRef(null);

  const categories = [
    { value: 'all', label: 'All Entries', emoji: '📚', color: 'gray' },
    { value: 'reflection', label: 'Reflection', emoji: '💭', color: 'blue' },
    { value: 'gratitude', label: 'Gratitude', emoji: '🙏', color: 'green' },
    { value: 'goals', label: 'Goals', emoji: '🎯', color: 'purple' },
    { value: 'challenges', label: 'Challenges', emoji: '💪', color: 'sage' },
    { value: 'wellness', label: 'Wellness', emoji: '🌱', color: 'emerald' },
    { value: 'work', label: 'Work', emoji: '💼', color: 'indigo' },
    { value: 'personal', label: 'Personal', emoji: '❤️', color: 'pink' }
  ];

  useEffect(() => {
    loadJournalData();
  }, []);

  useEffect(() => {
    // Scroll listener for infinite loading
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreEntries();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore]);

  const loadJournalData = async () => {
    try {
      setLoading(true);
      
      const [entriesResponse, statsResponse] = await Promise.all([
        api.getJournalEntries({ limit: 10, page: 1 }),
        api.getJournalStats()
      ]);

      // Load prompts separately
      let promptsResponse = null;
      try {
        promptsResponse = await api.getJournalPrompts({ type: 'reflection', count: 5 });
      } catch (error) {
        console.warn('Failed to load journal prompts:', error);
        promptsResponse = { success: false, data: { prompts: [] } };
      }

      if (entriesResponse.success) {
        const journalEntries = entriesResponse.data.journals || [];
        setEntries(journalEntries);
        setHasMore(journalEntries.length === 10);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data.statistics || statsResponse.data);
      }

      if (promptsResponse.success) {
        setPrompts(promptsResponse.data.prompts || []);
      }

    } catch (err) {
      console.error('Failed to load journal data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEntries = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await api.getJournalEntries({ limit: 10, page: nextPage });
      
      if (response.success) {
        const newEntries = response.data.journals || [];
        setEntries(prev => [...prev, ...newEntries]);
        setPage(nextPage);
        setHasMore(newEntries.length === 10);
      }
    } catch (error) {
      console.error('Failed to load more entries:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNewEntry = () => {
    setShowNewEntry(true);
    setTimeout(() => {
      newEntryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const createEntry = async (e) => {
    e.preventDefault();
    
    if (!newEntry.title.trim()) {
      toast.error('Please provide a title for your journal entry');
      return;
    }
    
    if (!newEntry.content.trim()) {
      toast.error('Please write some content for your journal entry');
      return;
    }
    
    if (newEntry.content.trim().length < 10) {
      toast.error('Content must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createJournalEntry({
        ...newEntry,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      if (response.success) {
        setEntries(prev => [response.data.journal, ...prev]);
        setNewEntry({
          title: '',
          content: '',
          category: 'reflection',
          mood: 3,
          tags: '',
          privacy: 'private'
        });
        setShowNewEntry(false);
        toast.success('Journal entry created successfully! 📝');
        
        // Refresh stats
        loadJournalData();
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
      toast.error('Failed to create journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (entryId) => {
    if (!entryId) return;
    
    try {
      const response = await api.deleteJournalEntry(entryId);
      if (response.success) {
        setEntries(prev => prev.filter(entry => (entry._id || entry.id) !== entryId));
        toast.success('Entry deleted successfully');
        loadJournalData(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const usePrompt = (prompt) => {
    const promptText = typeof prompt === 'string' ? prompt : prompt.text || '';
    setNewEntry(prev => ({
      ...prev,
      title: promptText.split('?')[0] + '?',
      content: promptText + '\n\n'
    }));
    handleNewEntry();
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄'
    };
    return moodMap[mood] || '😐';
  };

  const getCategoryData = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getFilteredEntries = () => {
    let filtered = entries;

    if (searchQuery.trim()) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    return filtered;
  };

  if (loading) {
    return <LoadingState message="Loading your journal..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load journal"
        description={error}
        onRetry={loadJournalData}
      />
    );
  }

  const filteredEntries = getFilteredEntries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100 to-sage-200">
      {/* Journal Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-sage-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wellness Journal</h1>
                <p className="text-gray-600">A space for your thoughts, reflections, and growth</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleNewEntry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-sage-500 to-sage-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Pencil className="h-5 w-5" />
              <span className="font-medium">Write New Entry</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Section */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-sage-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEntries || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-sage-500" />
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.currentStreak || 0} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageMood ? stats.averageMood.toFixed(1) : '0.0'}</p>
                </div>
                <span className="text-3xl">{getMoodEmoji(Math.round(stats.averageMood))}</span>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Words Written</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWords?.toLocaleString() || '0'}</p>
                </div>
                <Pencil className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Writing Prompts */}
        {prompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-sage-50 to-sage-100 rounded-2xl p-6 border border-sage-200/50 mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Lightbulb className="h-6 w-6 text-sage-600" />
              <h3 className="text-lg font-semibold text-gray-900">Writing Inspiration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prompts.slice(0, 4).map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => usePrompt(prompt)}
                  whileHover={{ scale: 1.02 }}
                  className="text-left p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-sage-200/50 hover:border-sage-300/50 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-sage-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {typeof prompt === 'string' ? prompt : prompt.text || 'No prompt available'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* New Entry Form */}
        <AnimatePresence>
          {showNewEntry && (
            <motion.div
              ref={newEntryRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sage-200/50 p-8 mb-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Pencil className="h-6 w-6 text-sage-500" />
                  <span>New Journal Entry</span>
                </h2>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={createEntry} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind?
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your entry a meaningful title..."
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Category and Mood */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newEntry.category}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    >
                      {categories.filter(c => c.value !== 'all').map(category => (
                        <option key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling?
                    </label>
                    <select
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    >
                      <option value={1}>😢 Very Poor</option>
                      <option value={2}>😕 Poor</option>
                      <option value={3}>😐 Fair</option>
                      <option value={4}>😊 Good</option>
                      <option value={5}>😄 Excellent</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your thoughts
                  </label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Pour your heart out... What happened today? How do you feel? What are you grateful for?"
                    rows={8}
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none transition-all duration-200"
                    style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}
                    maxLength={10000}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span className={newEntry.content.length < 10 ? 'text-red-500' : ''}>
                      {newEntry.content.length < 10 && `Minimum 10 characters required`}
                    </span>
                    <span className={newEntry.content.length > 9900 ? 'text-sage-500' : ''}>
                      {newEntry.content.length} / 10,000
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <input
                    type="text"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="grateful, growth, mindfulness, work-life-balance"
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas to help organize your entries</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewEntry(false)}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting || !newEntry.title.trim() || !newEntry.content.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {submitting ? 'Saving...' : 'Save Entry'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent min-w-[200px]"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.emoji} {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Journal Entries Timeline */}
        <div className="space-y-6">
          {filteredEntries.length > 0 ? (
            <AnimatePresence>
              {filteredEntries.map((entry, index) => {
                const categoryData = getCategoryData(entry.category);
                
                return (
                  <motion.div
                    key={entry._id || entry.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Entry Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${categoryData.color}-100 text-${categoryData.color}-800`}>
                            {categoryData.emoji} {categoryData.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{entry.title}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this entry?')) {
                              deleteEntry(entry._id || entry.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Content */}
                    <div className="prose max-w-none mb-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                        {entry.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {entry.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Entry Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <span>{entry.wordCount || (entry.content || '').split(' ').filter(word => word).length} words</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchQuery || selectedCategory !== 'all' ? 'No entries found' : 'Start your wellness journey'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Begin documenting your thoughts, feelings, and growth. Your future self will thank you.'
                }
              </p>
              {(!searchQuery && selectedCategory === 'all') && (
                <motion.button
                  onClick={handleNewEntry}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-sage-500 to-sage-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Write Your First Entry
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Load More Indicator */}
          {loadingMore && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-sage-500 rounded-full animate-spin"></div>
                <span>Loading more entries...</span>
              </div>
            </div>
          )}

          {/* End of entries message */}
          {!hasMore && filteredEntries.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of your journal entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;