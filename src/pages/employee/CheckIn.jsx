import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
import useWellnessStore from '../../store/wellnessStore';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import DailyQuote from '../../components/shared/DailyQuote';

const moodOptions = [
  { value: 1, emoji: '😢', label: 'Very Poor', color: 'text-red-500' },
  { value: 2, emoji: '😕', label: 'Poor', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Fair', color: 'text-yellow-500' },
  { value: 4, emoji: '😊', label: 'Good', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Excellent', color: 'text-emerald-500' },
];


function CheckIn() {
  const [formData, setFormData] = useState({
    mood: null,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [timeUntilNext, setTimeUntilNext] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  const { submitCheckIn, getTodayCheckIn } = useWellnessStore();
  const { user, updateWellnessStats } = useAuthStore();
  const { toast } = useToast();

  // Calculate time until next check-in (midnight)
  const calculateTimeUntilNext = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMs: diff };
  };

  const formatTime = (time) => {
    if (!time) return '';
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Check if user has already checked in today
    const checkTodayStatus = async () => {
      setIsLoadingInitial(true);
      try {
        const response = await getTodayCheckIn();
        console.log('🔍 CheckIn - getTodayCheckIn response:', response);
        
        if (response && response.success && response.data.checkedInToday && response.data.checkIn) {
          console.log('🔍 CheckIn - User has already checked in today');
          setHasCheckedInToday(true);
          setTodayCheckIn(response.data.checkIn);
          setFormData({
            mood: response.data.checkIn.mood || null,
            comment: response.data.checkIn.feedback || '' // Note: API uses 'feedback' not 'comment'
          });
        } else {
          console.log('🔍 CheckIn - User has not checked in today yet');
          setHasCheckedInToday(false);
          setTodayCheckIn(null);
        }
      } catch (error) {
        console.error('Error checking today status:', error);
        // On error, assume not checked in to allow form submission
        setHasCheckedInToday(false);
        setTodayCheckIn(null);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    checkTodayStatus();
  }, [getTodayCheckIn]);

  // Timer effect for countdown
  useEffect(() => {
    let interval;
    
    if (hasCheckedInToday) {
      const updateTimer = () => {
        const time = calculateTimeUntilNext();
        setTimeUntilNext(time);
        
        // Reset the state when time is up (new day)
        if (time.totalMs <= 0) {
          setHasCheckedInToday(false);
          setTodayCheckIn(null);
          setTimeUntilNext(null);
          // Reset form data
          setFormData({
            mood: null,
            comment: ''
          });
        }
      };
      
      // Update immediately
      updateTimer();
      
      // Update every second
      interval = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hasCheckedInToday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mood || isSubmitting || hasCheckedInToday) return;

    setIsSubmitting(true);
    try {
      const checkInData = {
        mood: formData.mood,
        feedback: formData.comment.trim() || null,
        source: 'web'
      };
      
      const result = await submitCheckIn(checkInData);
      
      setHasCheckedInToday(true);
      setTodayCheckIn(result.checkIn);
      
      // Update user wellness stats in real-time
      console.log('🔍 CHECK-IN COMPONENT - Result:', result);
      if (result.user) {
        console.log('🔍 CHECK-IN COMPONENT - Updating user stats:', {
          happyCoins: result.user.totalHappyCoins,
          currentStreak: result.user.currentStreak,
          longestStreak: result.user.longestStreak
        });
        updateWellnessStats({
          happyCoins: result.user.totalHappyCoins,
          currentStreak: result.user.currentStreak,
          longestStreak: result.user.longestStreak
        });
      }
      
      const coinsEarned = result.happyCoinsEarned || 75;
      toast.success(`Check-in submitted! You earned ${coinsEarned} Happy Coins!`, 'Great Job!');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      
      // Handle specific error cases
      if (error.message === 'You have already checked in today') {
        // User has already checked in - refresh the today status
        try {
          const today = await getTodayCheckIn();
          if (today && today.success && today.data.checkedInToday && today.data.checkIn) {
            setHasCheckedInToday(true);
            setTodayCheckIn(today.data.checkIn);
            toast.info('You have already completed your check-in for today!', 'Already Complete');
          }
        } catch (refreshError) {
          console.error('Error refreshing today status:', refreshError);
        }
      } else {
        toast.error('Failed to submit check-in. Please try again.', 'Check-in Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodLabel = (rating) => {
    const mood = moodOptions.find(m => m.value === rating);
    return mood ? mood.label : 'Unknown';
  };

  const getMoodEmoji = (rating) => {
    const mood = moodOptions.find(m => m.value === rating);
    return mood ? mood.emoji : '😐';
  };

  // Show loading state while checking initial status
  if (isLoadingInitial) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <PageHeader
          title="Daily WelldifyAI Check-in"
          subtitle="Loading your check-in status..."
          icon={HeartIcon}
        />
        <div className="card-glass flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner w-6 h-6"></div>
            <span className="text-gray-600">Checking your check-in status...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (hasCheckedInToday && todayCheckIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <PageHeader
          title="Daily Check-in Complete!"
          subtitle="Thank you for sharing how you're feeling today."
          icon={HeartIcon}
        />

        {/* Daily Quote */}
        <DailyQuote className="mb-6" />

        <div className="card-glass mb-6">
          <div className="text-center">
            <div className="text-8xl mb-4">
              {getMoodEmoji(todayCheckIn.mood)}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You're feeling {getMoodLabel(todayCheckIn.mood).toLowerCase()} today
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <span className="text-sm text-gray-600">Mood Rating:</span>
              <div className="text-lg font-semibold text-gray-900">{todayCheckIn.mood}/5</div>
            </div>
            
            {todayCheckIn.feedback && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Comment:</h4>
                <p className="text-gray-700 text-left">{todayCheckIn.feedback}</p>
              </div>
            )}
            
          </div>
        </div>

        <div className="card-primary">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Happy Coins Earned!
              </h3>
              <p className="text-gray-600 text-sm">
                You've earned 75 Happy Coins for today's check-in.
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-2xl font-bold text-sage-600">+75</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="card-glass">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Next Check-in Available In
            </h3>
            {timeUntilNext && (
              <div className="bg-gradient-to-r from-sage-500 to-sage-600 text-white rounded-xl p-6">
                <div className="text-4xl font-bold font-mono mb-2">
                  {formatTime(timeUntilNext)}
                </div>
                <div className="text-sm opacity-90">
                  Hours : Minutes : Seconds
                </div>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4">
              Your check-in will reset at midnight
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <PageHeader
        title="Daily WelldifyAI Check-in"
        subtitle="How are you feeling today? Share your mood and earn Happy Coins!"
        icon={HeartIcon}
      />

      {/* Daily Quote */}
      <DailyQuote className="mb-8" />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mood Selection */}
        <div className="card-glass">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Rate your mood today (1-5)
          </h2>
          
          <div className="grid grid-cols-5 gap-4">
            {moodOptions.map((mood) => (
              <motion.div
                key={mood.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`mood-option ${
                  formData.mood === mood.value ? 'selected' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
              >
                <div className="mood-emoji">{mood.emoji}</div>
                <div className="mood-label">{mood.label}</div>
                <div className="text-xs text-gray-500 mt-1">{mood.value}/5</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Optional Comment */}
        <div className="card-glass">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Share more about your day (optional)
          </h2>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="What's contributing to how you feel today? Any thoughts you'd like to share..."
            className="input-primary h-32 resize-none"
            maxLength={500}
          />
          <div className="text-right mt-2">
            <span className="text-sm text-gray-500">
              {formData.comment.length}/500 characters
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🪙</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Reward</h3>
                <p className="text-sm text-gray-600">Earn 75 Happy Coins</p>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!formData.mood || isSubmitting}
            className={`w-full btn-primary ${
              !formData.mood || isSubmitting
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner w-5 h-5"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Complete Check-in'
            )}
          </button>
          
          {!formData.mood && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Please select your mood to continue
            </p>
          )}
        </div>
      </form>
    </motion.div>
  );
}

export default CheckIn;