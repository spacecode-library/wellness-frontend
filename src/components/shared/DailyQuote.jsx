import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Quote, 
  Heart, 
  Share,
  RefreshCw
} from 'lucide-react';
import { useToast } from './Toast';
import api from '../../services/api';

const DailyQuote = ({ className = "" }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [viewStartTime, setViewStartTime] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    loadTodayQuote();
    setViewStartTime(Date.now());

    // Mark as viewed when component unmounts
    return () => {
      if (quote && viewStartTime) {
        const viewingTime = Date.now() - viewStartTime;
        markAsViewed(viewingTime);
      }
    };
  }, []);

  const loadTodayQuote = async () => {
    try {
      setLoading(true);
      const response = await api.getTodayQuote();
      
      if (response.success && response.data.quote) {
        setQuote(response.data.quote);
        setLiked(response.data.quote.isLiked || false);
      }
    } catch (error) {
      console.error('Failed to load daily quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (viewingTime) => {
    if (!quote) return;
    
    try {
      await api.markQuoteAsViewed(quote._id || quote.id, viewingTime);
    } catch (error) {
      console.error('Failed to mark quote as viewed:', error);
    }
  };

  const handleLike = async () => {
    if (!quote) return;
    
    try {
      const response = await api.toggleQuoteLike(quote._id || quote.id);
      if (response.success) {
        setLiked(!liked);
        toast.success(liked ? 'Quote unliked' : 'Quote liked!');
      }
    } catch (error) {
      console.error('Failed to like quote:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleShare = async () => {
    if (!quote) return;

    try {
      const response = await api.shareQuote(quote._id || quote.id);
      if (response.success && response.data.shareText) {
        // Use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: 'Daily Motivation',
            text: response.data.shareText
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(response.data.shareText);
          toast.success('Quote copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Failed to share quote:', error);
      toast.error('Failed to share quote');
    }
  };

  const getCategoryLabel = (category) => {
    const labelMap = {
      motivation: 'Motivation',
      wellness: 'Wellness',
      productivity: 'Productivity',
      mindfulness: 'Mindfulness',
      success: 'Success',
      happiness: 'Happiness',
      growth: 'Growth',
      inspiration: 'Inspiration'
    };
    return labelMap[category] || 'Inspiration';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}>
        <div className="text-center">
          <Quote className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No quote available today</p>
          <button
            onClick={loadTodayQuote}
            className="mt-2 text-sage-600 hover:text-sage-700 text-sm font-medium flex items-center space-x-1 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
            <Quote className="h-5 w-5 text-sage-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Daily Inspiration</h3>
            <p className="text-xs text-gray-500">{formatDate()}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-xs font-medium">
          {getCategoryLabel(quote.category)}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="mb-6">
        <div className="relative">
          <div className="absolute -top-2 -left-1 text-4xl text-sage-200 font-serif leading-none">
            "
          </div>
          <p className="text-lg text-gray-800 leading-relaxed font-medium pl-6 mb-3 italic">
            {quote.quote}
          </p>
          {quote.author && (
            <cite className="text-sm text-gray-600 font-medium pl-6 block">
              — {quote.author}
            </cite>
          )}
        </div>
      </blockquote>

      {/* Bottom section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-colors ${
              liked 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={liked ? 'Unlike quote' : 'Like quote'}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
          </motion.button>
          
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Share quote"
          >
            <Share className="h-4 w-4" />
          </motion.button>
        </div>
        
        {/* GPT Attribution */}
        <div className="text-xs text-gray-400 flex items-center space-x-1">
          <span>Generated by</span>
          <span className="font-medium text-gray-500">GPT-4</span>
        </div>
      </div>

      {/* Reflection prompt if available */}
      {quote.reflectionPrompt && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="bg-sage-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-sage-700">Reflection:</span> {quote.reflectionPrompt}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DailyQuote;