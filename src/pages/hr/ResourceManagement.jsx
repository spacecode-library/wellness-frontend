import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  Tag,
  Calendar,
  Users,
  FileText,
  Video,
  Link,
  Star,
  CheckCircle,
  ThumbsUp
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedResourceAnalytics, setSelectedResourceAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📚' },
    { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
    { value: 'stress_management', label: 'Stress Management', icon: '🧘' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘‍♀️' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'work_life_balance', label: 'Work-Life Balance', icon: '⚖️' },
    { value: 'team_building', label: 'Team Building', icon: '👥' },
    { value: 'leadership', label: 'Leadership', icon: '🎯' },
    { value: 'productivity', label: 'Productivity', icon: '⚡' }
  ];

  const resourceTypes = [
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'audio', label: 'Audio', icon: '🎧' },
    { value: 'infographic', label: 'Infographic', icon: '📊' },
    { value: 'checklist', label: 'Checklist', icon: '✅' },
    { value: 'worksheet', label: 'Worksheet', icon: '📋' },
    { value: 'guide', label: 'Guide', icon: BookOpen },
    { value: 'podcast', label: 'Podcast', icon: '🎙️' }
  ];

  // Template resources with high-quality, actionable content
  const templateResources = [
    {
      title: "5-Minute Desk Meditation Guide",
      description: "A quick, science-backed meditation routine perfect for busy workdays. Reduces stress and improves focus.",
      category: "mental_health",
      type: "guide",
      content: `# 5-Minute Desk Meditation Guide

## Why This Works
Research shows that even 5 minutes of meditation can reduce cortisol levels by 23% and improve focus for up to 2 hours.

## The BREATH Technique

**B** - Breathe naturally
**R** - Relax your shoulders
**E** - Eyes closed or softly focused
**A** - Acknowledge thoughts without judgment
**T** - Take your time
**H** - Honor your practice

## Step-by-Step Instructions

1. **Minute 1-2: Settling In**
   - Sit comfortably with feet flat on floor
   - Close eyes or soften your gaze
   - Take 3 deep breaths (4 counts in, 6 counts out)

2. **Minute 3-4: Focus**
   - Return to natural breathing
   - Count breaths from 1-10, then restart
   - When mind wanders, gently return to counting

3. **Minute 5: Integration**
   - Set an intention for your day
   - Slowly open your eyes
   - Take a moment to notice how you feel

## Pro Tips
- Use a phone timer with gentle chimes
- Same time daily builds habit (try 2 PM for afternoon reset)
- Track your mood before/after for motivation`,
      tags: ["meditation", "stress-relief", "productivity", "mindfulness"],
      estimatedTime: 5,
      difficulty: "beginner",
      isTemplate: true
    },
    {
      title: "Ergonomic Workspace Setup Checklist",
      description: "Prevent workplace injuries with this comprehensive ergonomic assessment. Reduce back pain and improve posture.",
      category: "fitness",
      type: "checklist",
      content: `# Ergonomic Workspace Assessment

## Why This Matters
Poor ergonomics cause 33% of workplace injuries. This checklist can reduce discomfort by up to 60%.

## Monitor & Screen Setup ✓
- [ ] Top of screen at or below eye level
- [ ] Screen 20-26 inches from your eyes
- [ ] No glare or reflections on screen
- [ ] Text size comfortable to read
- [ ] Secondary monitors at same height

## Chair & Posture ✓
- [ ] Feet flat on floor (or footrest)
- [ ] Knees at 90-degree angle
- [ ] Back fully supported by chair
- [ ] Armrests support forearms
- [ ] Can sit all the way back in chair

## Desk & Accessories ✓
- [ ] Elbows at 90-degree angle when typing
- [ ] Wrists straight, not bent up or down
- [ ] Mouse at same level as keyboard
- [ ] Frequently used items within arm's reach
- [ ] Document holder at screen level

## Movement & Breaks ✓
- [ ] Stand/move every 30-60 minutes
- [ ] Stretch shoulders and neck hourly
- [ ] Eye breaks every 20 minutes (20-20-20 rule)
- [ ] Vary your posture throughout day

## Quick Fixes
**Laptop Users:** External keyboard/mouse + laptop stand
**No Footrest:** Use stack of books
**Poor Lighting:** Adjust blinds or add desk lamp
**Neck Strain:** Lower monitor or raise chair

## Red Flags - See HR/Medical
- Persistent pain lasting >2 days
- Numbness or tingling
- Morning stiffness that's new`,
      tags: ["ergonomics", "posture", "workplace-safety", "physical-health"],
      estimatedTime: 15,
      difficulty: "beginner",
      isTemplate: true
    },
    {
      title: "Healthy Meal Prep for Busy Professionals",
      description: "Time-efficient nutrition strategies that boost energy and brain function. Includes 7-day meal plan.",
      category: "nutrition",
      type: "guide",
      content: `# Healthy Meal Prep for Busy Professionals

## The Science
Proper nutrition increases productivity by 25% and reduces afternoon energy crashes by 40%.

## The 80/20 Approach
Focus on 20% of foods that give 80% of nutritional benefits:
- **Brain Foods:** Blueberries, salmon, walnuts, dark chocolate
- **Energy Foods:** Quinoa, sweet potatoes, Greek yogurt
- **Focus Foods:** Green tea, avocados, eggs, spinach

## Sunday Prep Strategy (90 minutes total)

### Proteins (20 minutes)
- Bake 3 chicken breasts with herbs
- Hard boil 6 eggs
- Cook 1 cup quinoa

### Vegetables (30 minutes)
- Roast mixed vegetables (broccoli, bell peppers, zucchini)
- Prep salad ingredients in containers
- Wash and portion berries

### Smart Snacks (15 minutes)
- Portion nuts into small containers
- Make overnight oats (3 varieties)
- Prep veggie sticks with hummus

### Assembly (25 minutes)
- Create 5 grab-and-go meals
- Portion everything into containers
- Label with days of week

## 7-Day Meal Plan

**Monday**
- Breakfast: Greek yogurt with berries and walnuts
- Lunch: Quinoa bowl with roasted vegetables and chicken
- Snack: Apple with almond butter
- Dinner: Salmon with sweet potato and greens

**Tuesday-Sunday:** [Similar detailed breakdown]

## Emergency Options
- Smoothie packs (frozen fruit + protein powder)
- Healthy freezer meals
- Office snack stash (nuts, protein bars)

## Budget Tips
- Buy seasonal produce
- Frozen vegetables are nutritious and convenient
- Bulk buying for staples
- One new recipe per week to avoid boredom`,
      tags: ["nutrition", "meal-prep", "energy", "productivity"],
      estimatedTime: 20,
      difficulty: "intermediate",
      isTemplate: true
    },
    {
      title: "Building Psychological Safety on Your Team",
      description: "Evidence-based strategies for creating team environments where everyone feels safe to contribute and make mistakes.",
      category: "team_building",
      type: "guide",
      content: `# Building Psychological Safety on Your Team

## What is Psychological Safety?
The belief that you can speak up without risk of punishment or humiliation. Google found it's the #1 factor in high-performing teams.

## The Business Case
Teams with high psychological safety:
- Make 67% fewer errors
- Are 76% more likely to engage in problem-solving
- Have 57% better collaboration
- Generate 67% more breakthrough ideas

## The SPACE Framework

### **S** - Speak Up is Encouraged
- Ask "What are we missing?" in meetings
- Thank people for raising concerns
- Share your own mistakes and learnings
- Never punish someone for bringing bad news

### **P** - Perspectives are Valued
- Start meetings with diverse viewpoints
- Actively seek quiet voices: "Sarah, what's your take?"
- Acknowledge contributions: "That's a great point because..."
- Challenge ideas, not people

### **A** - Assumptions are Questioned
- Use "Help me understand..." instead of "You're wrong"
- Ask "What would have to be true for this to work?"
- Encourage experiments and pilots
- Model curiosity over certainty

### **C** - Conflict is Productive
- Focus on facts and outcomes
- Use "Yes, and..." instead of "Yes, but..."
- Address tension early and directly
- Separate ideas from identity

### **E** - Effort is Recognized
- Celebrate learning from failures
- Acknowledge process, not just results
- Give specific, actionable feedback
- Create learning moments from setbacks

## Weekly Team Check-ins
1. "What went well this week?"
2. "What could we improve?"
3. "What did we learn?"
4. "What support do you need?"

## Warning Signs of Low Safety
- People stay quiet in meetings
- No one asks questions
- Blame culture when things go wrong
- Ideas only come from senior members
- People work in silos

## Quick Wins This Week
- End meetings with "What questions do we still have?"
- Share a recent mistake you made and what you learned
- Ask someone junior for their opinion on a decision
- Thank someone publicly for raising a concern`,
      tags: ["leadership", "team-building", "communication", "management"],
      estimatedTime: 25,
      difficulty: "intermediate",
      isTemplate: true
    },
    {
      title: "The Science of Better Sleep for Peak Performance",
      description: "Optimize your sleep for better focus, creativity, and emotional regulation. Includes sleep hygiene audit.",
      category: "sleep",
      type: "guide",
      content: `# The Science of Better Sleep for Peak Performance

## Why Sleep Matters at Work
- 7+ hours: 23% better performance
- Poor sleep: Equivalent to 0.10% blood alcohol (legally impaired)
- Good sleep: 40% better problem-solving ability

## The Sleep-Performance Connection

### Cognitive Functions
- **Memory consolidation:** 40% better retention
- **Creative thinking:** 33% more innovative solutions
- **Decision making:** 50% fewer errors
- **Emotional regulation:** 60% better stress response

## Sleep Hygiene Audit

### Environment (Score: ___/20)
- [ ] Room temperature 65-68°F (4 points)
- [ ] Complete darkness or blackout curtains (4 points)
- [ ] Quiet environment or white noise (4 points)
- [ ] Comfortable mattress and pillows (4 points)
- [ ] No screens visible from bed (4 points)

### Routine (Score: ___/25)
- [ ] Same bedtime within 30 minutes daily (5 points)
- [ ] Wind-down routine 30-60 minutes before bed (5 points)
- [ ] No caffeine after 2 PM (5 points)
- [ ] No alcohol 3 hours before bed (5 points)
- [ ] Last meal 2-3 hours before sleep (5 points)

### Daytime Habits (Score: ___/15)
- [ ] Morning sunlight within 1 hour of waking (5 points)
- [ ] Regular exercise (not within 3 hours of bed) (5 points)
- [ ] Manage stress/anxiety before bed (5 points)

**Total Score: ___/60**
- 50-60: Sleep hygiene champion
- 40-49: Good foundation, few tweaks needed
- 30-39: Moderate improvements needed
- <30: Significant changes recommended

## The Perfect Evening Routine

### 2 Hours Before Bed
- Dim lights to 50% or use warm light bulbs
- Finish eating and drinking (except water)
- Handle tomorrow's priorities (write them down)

### 1 Hour Before Bed
- No screens or use blue light filters
- Gentle activities: reading, stretching, meditation
- Prepare bedroom (cool, dark, quiet)

### 30 Minutes Before Bed
- Quick gratitude reflection (3 things)
- Progressive muscle relaxation
- Deep breathing (4-7-8 technique)

## Power Nap Protocol
- **Duration:** 10-20 minutes maximum
- **Timing:** 1-3 PM (natural circadian dip)
- **Environment:** Dark, quiet, slightly cool
- **Recovery:** 15 minutes to fully alert

## Troubleshooting Common Issues

**Can't Fall Asleep?**
- Try the 4-7-8 breathing technique
- Progressive muscle relaxation
- "Mind dump" worries in a journal

**Wake Up at 3 AM?**
- Don't check the time
- Stay in bed, practice breathing
- If awake >20 minutes, read until sleepy

**Morning Grogginess?**
- Get sunlight immediately upon waking
- Drink 16 oz water
- Light exercise or stretching`,
      tags: ["sleep", "performance", "health", "energy"],
      estimatedTime: 30,
      difficulty: "beginner",
      isTemplate: true
    },
    {
      title: "Stress Management Toolkit for High-Pressure Environments",
      description: "Research-backed techniques for managing stress in real-time. Includes quick relief strategies and long-term resilience building.",
      category: "stress_management",
      type: "guide",
      content: `# Stress Management Toolkit for High-Pressure Environments

## Understanding Your Stress Response

### Physical Signs
- Tension in shoulders/neck
- Shallow breathing
- Increased heart rate
- Digestive issues
- Fatigue despite being "wired"

### Mental Signs
- Racing thoughts
- Difficulty concentrating
- Overthinking/rumination
- Forgetfulness
- Indecisiveness

### Emotional Signs
- Irritability or impatience
- Feeling overwhelmed
- Anxiety or worry
- Mood swings
- Feeling disconnected

## Immediate Relief Techniques (Use in the moment)

### 1. Box Breathing (2 minutes)
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold empty for 4 counts
- Repeat 4-8 cycles

### 2. 5-4-3-2-1 Grounding (3 minutes)
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

### 3. Progressive Muscle Release (5 minutes)
- Tense shoulders for 5 seconds, release
- Tense arms for 5 seconds, release
- Continue through body systematically
- Notice the contrast between tension and relaxation

### 4. Cognitive Reframing (2 minutes)
Ask yourself:
- "Is this thought helpful right now?"
- "What would I tell a friend in this situation?"
- "What's one small action I can take?"
- "How will this matter in 5 years?"

## Daily Resilience Building

### Morning Armor (10 minutes)
- Set 3 priorities for the day
- Visualize handling challenges calmly
- Practice gratitude (3 specific items)
- Deep breathing or brief meditation

### Midday Reset Options
- **2-minute option:** Step outside, breathe fresh air
- **5-minute option:** Walk around the building
- **10-minute option:** Guided meditation app
- **15-minute option:** Call a supportive friend/family

### Evening Decompression
- "Transition ritual" from work to personal time
- Physical activity to burn off stress hormones
- Journal or discuss the day with someone
- Plan something enjoyable for tomorrow

## Workplace Stress Strategies

### Email/Communication Overwhelm
- Check email at set times only (9 AM, 1 PM, 4 PM)
- Use "BRIEF" method: Brief, Relevant, Informative, Engaging, Friendly
- Set up auto-responders for response time expectations
- Unsubscribe from non-essential communications

### Meeting Stress
- Arrive 5 minutes early to settle
- Bring water and take sip breaks
- Practice good posture to signal confidence
- Prepare 2-3 key points in advance

### Deadline Pressure
- Break large tasks into 25-minute focused work sessions
- Identify what "good enough" looks like vs. perfect
- Communicate early if timeline is unrealistic
- Celebrate progress, not just completion

## Emergency Stress Protocol

**When you feel panic/overwhelm coming:**

1. **STOP** - Pause whatever you're doing
2. **BREATHE** - Take 3 deep belly breaths
3. **OBSERVE** - Notice thoughts, feelings, body sensations
4. **PROCEED** - Choose one small helpful action

## Building Long-term Resilience

### Weekly Practices
- Schedule non-negotiable downtime
- Practice saying "no" to non-essential requests
- Connect with supportive relationships
- Engage in activities that restore energy

### Monthly Check-ins
- Review what stressors are controllable vs. not
- Assess whether coping strategies are working
- Adjust routines based on what you've learned
- Consider professional support if needed

## When to Seek Additional Support
- Stress interferes with sleep for >2 weeks
- Physical symptoms persist (headaches, stomach issues)
- Using substances to cope
- Relationships are being negatively affected
- Work performance consistently declining`,
      tags: ["stress-management", "resilience", "mental-health", "coping-strategies"],
      estimatedTime: 45,
      difficulty: "intermediate",
      isTemplate: true
    }
  ];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await api.getResources();
      
      if (response.success) {
        setResources(response.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchQuery.trim()) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const handleCreateResource = async (resourceData) => {
    try {
      const response = await api.createResource(resourceData);
      if (response.success) {
        setResources(prev => [response.data.resource, ...prev]);
        setShowModal(false);
        toast.success('Resource created successfully!');
      }
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast.error('Failed to create resource');
    }
  };

  const handleUpdateResource = async (resourceId, resourceData) => {
    try {
      const response = await api.updateResource(resourceId, resourceData);
      if (response.success) {
        setResources(prev => prev.map(resource => 
          resource._id === resourceId ? response.data.resource : resource
        ));
        setEditingResource(null);
        setShowModal(false);
        toast.success('Resource updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update resource:', error);
      toast.error('Failed to update resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await api.deleteResource(resourceId);
      if (response.success) {
        setResources(prev => prev.filter(resource => resource._id !== resourceId));
        toast.success('Resource deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleUseTemplate = (template) => {
    // Remove any ID fields from template to ensure it's treated as a new item
    const { _id, id, ...templateData } = template;
    setEditingResource(templateData);
    setShowModal(true);
    setShowTemplates(false);
  };

  const handleViewAnalytics = async (resourceId) => {
    try {
      const response = await api.request(`/resources/${resourceId}/analytics`);
      if (response.success) {
        setSelectedResourceAnalytics(response.data);
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load resource analytics');
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = resourceTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FileText;
  };

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || { label: category, icon: '📚' };
  };

  if (loading) {
    return <LoadingState message="Loading resources..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Failed to load resources"
        description={error}
        onRetry={loadResources}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Management"
        subtitle="Create and manage wellness resources for your team"
        icon={BookOpen}
        iconColor="text-blue-600"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        {/* Search and Filter */}
        <div className="flex flex-1 space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
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
            <Star className="h-5 w-5" />
            <span>Templates</span>
          </button>
          
          <button
            onClick={() => {
              setEditingResource(null);
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Resource</span>
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            const categoryInfo = getCategoryInfo(resource.category);
            
            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {typeof TypeIcon === 'string' ? (
                        <span className="text-lg">{TypeIcon}</span>
                      ) : (
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewAnalytics(resource._id)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="View Analytics"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingResource(resource);
                        setShowModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Resource"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{resource.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Footer with Enhanced Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                    {resource.estimatedTime && (
                      <span>{resource.estimatedTime} min read</span>
                    )}
                  </div>
                  
                  {/* Resource Analytics */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <Eye className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-semibold text-gray-900">{resource.analytics?.views || 0}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-600 mb-1">
                        <CheckCircle className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-semibold text-gray-900">{resource.analytics?.completions || 0}</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-red-600 mb-1">
                        <ThumbsUp className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-semibold text-gray-900">{resource.analytics?.likes || 0}</div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center text-yellow-600 mb-1">
                        <Star className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-semibold text-gray-900">
                        {resource.analytics?.averageRating ? resource.analytics.averageRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No resources found' : 'No resources yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first wellness resource to get started'
            }
          </p>
          {(!searchQuery && selectedCategory === 'all') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Resource
            </button>
          )}
        </motion.div>
      )}

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templateResources}
        onUseTemplate={handleUseTemplate}
      />

      {/* Resource Modal */}
      <ResourceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingResource(null);
        }}
        resource={editingResource}
        categories={categories.filter(c => c.value !== 'all')}
        resourceTypes={resourceTypes}
        onSubmit={editingResource?._id ? 
          (data) => handleUpdateResource(editingResource._id, data) : 
          handleCreateResource
        }
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => {
          setShowAnalytics(false);
          setSelectedResourceAnalytics(null);
        }}
        analytics={selectedResourceAnalytics}
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resource Templates</h2>
              <p className="text-gray-600 text-sm mt-1">Choose from professionally crafted wellness resources</p>
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
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {template.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {template.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{template.estimatedTime} min</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 4).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <button
                  onClick={() => onUseTemplate(template)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
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

// Resource Modal Component
const ResourceModal = ({ isOpen, onClose, resource, categories, resourceTypes, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'mental_health',
    type: 'article',
    tags: '',
    estimatedTime: '',
    difficulty: 'beginner',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        content: resource.content?.body || resource.content || '',
        category: resource.category || 'mental_health',
        type: resource.type || 'article',
        tags: resource.tags ? resource.tags.join(', ') : '',
        estimatedTime: resource.estimatedTime || '',
        difficulty: resource.difficulty || 'beginner',
        isActive: resource.isActive !== undefined ? resource.isActive : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        category: 'mental_health',
        type: 'article',
        tags: '',
        estimatedTime: '',
        difficulty: 'beginner',
        isActive: true
      });
    }
  }, [resource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate accurate reading time
      const calculatedReadingTime = calculateReadingTime(formData.content);
      
      const submitData = {
        title: formData.title,
        description: formData.description,
        content: {
          body: formData.content
        },
        category: formData.category,
        type: formData.type,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        readingTime: calculatedReadingTime, // Use calculated reading time
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : calculatedReadingTime,
        status: 'published' // Ensure resources are published by default
      };
      
      await onSubmit(submitData);
      
      // Reset form if creating new resource
      if (!resource) {
        setFormData({
          title: '',
          description: '',
          content: '',
          category: 'mental_health',
          type: 'article',
          tags: '',
          estimatedTime: '',
          difficulty: 'beginner',
          isActive: true
        });
      }
    } catch (error) {
      console.error('Failed to submit resource:', error);
    } finally {
      setSubmitting(false);
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
              {resource ? 'Edit Resource' : 'Create New Resource'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resource title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="15"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="Brief description of what this resource covers..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Main content of the resource. Supports markdown formatting..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Tip: Use markdown for formatting. ## for headings, **bold**, *italic*, - for bullet points
            </p>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="wellness, stress-relief, productivity"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (visible to employees)
              </label>
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
              disabled={submitting || !formData.title.trim() || !formData.description.trim() || !formData.content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : (resource ? 'Update Resource' : 'Create Resource')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Analytics Modal Component
const AnalyticsModal = ({ isOpen, onClose, analytics }) => {
  if (!isOpen || !analytics) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resource Analytics</h2>
              <p className="text-gray-600 text-sm mt-1">{analytics.resource?.title}</p>
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
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.overview?.views || 0}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.overview?.completions || 0}</div>
              <div className="text-sm text-gray-600">Completions</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{analytics.overview?.likes || 0}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.overview?.averageRating ? analytics.overview.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">{analytics.engagement?.viewsToCompletion || 0}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">{analytics.engagement?.likesRate || 0}%</div>
                <div className="text-sm text-gray-600">Like Rate</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-lg font-bold text-gray-900">{analytics.engagement?.downloadsRate || 0}%</div>
                <div className="text-sm text-gray-600">Download Rate</div>
              </div>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* By Department */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Views by Department</h3>
              <div className="space-y-3">
                {Object.entries(analytics.userBreakdown?.byDepartment || {}).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-gray-700">{dept}</span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 rounded-full px-3 py-1">
                        <span className="text-sm font-medium text-blue-700">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Completion Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Completed</span>
                  <div className="bg-green-100 rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-green-700">
                      {analytics.userBreakdown?.byCompletion?.completed || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">In Progress</span>
                  <div className="bg-yellow-100 rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-yellow-700">
                      {analytics.userBreakdown?.byCompletion?.inProgress || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Viewed Only</span>
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">
                      {analytics.userBreakdown?.byCompletion?.viewed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResourceManagement;