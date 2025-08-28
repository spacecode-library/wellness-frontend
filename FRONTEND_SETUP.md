# WellnessAI Frontend Development Guide

## Project Overview
- **Tech Stack**: React 19 + Vite + TypeScript + Tailwind CSS
- **Design**: Apple-inspired, premium wellness theme
- **Backend**: Already implemented (http://localhost:8005/api)
- **Timeline**: 7 days

## Amy's Key Requirements
1. **Daily Wellbeing Check-in** (1-5 scale) - Priority #1  
2. **Weekly Pulse Questions** (3 questions) - Priority #2
3. **HR Insight Dashboard** with risk flagging - Priority #3
4. **WhatsApp Integration** for notifications
5. **Professional, modern, Apple-inspired UI**

## Installation Commands

### 1. Install Core Dependencies
```bash
# UI Framework & Styling
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/forms @tailwindcss/typography
npm install clsx tailwind-merge class-variance-authority

# Icons & Animation
npm install lucide-react framer-motion
npm install @radix-ui/react-icons

# Form Handling
npm install react-hook-form @hookform/resolvers zod

# Routing & State Management
npm install react-router-dom
npm install zustand @tanstack/react-query
npm install axios js-cookie

# Charts & Data Visualization
npm install recharts date-fns

# UI Components (Radix UI)
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-popover
npm install @radix-ui/react-switch
npm install @radix-ui/react-slider
npm install @radix-ui/react-progress
npm install @radix-ui/react-alert-dialog

# Development Tools
npm install -D @types/js-cookie
```

### 2. Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

## Premium Color Palette (Amy Approved)
```css
:root {
  /* Primary Wellness Colors */
  --primary: #8fbc8f;        /* Sage Green */
  --primary-light: #add0b3;  /* Pastel Mint */
  --primary-dark: #6b8e6b;   /* Dark Sage */
  
  /* Apple-Inspired Colors */
  --background: #ffffff;      /* Pure White */
  --background-secondary: #f5f5f7; /* Light Grey */
  --text-primary: #1d1d1f;   /* Near Black */
  --text-secondary: #6e6e73; /* Medium Grey */
  --accent: #007aff;         /* iOS Blue */
  
  /* Status Colors */
  --success: #34c759;        /* Green */
  --warning: #ff9500;        /* Orange */
  --danger: #ff3b30;         /* Red */
  
  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.2);
  --shadow-soft: 0 2px 20px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

## Project Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   └── Spinner.jsx
│   ├── features/           # Feature-specific components
│   │   ├── checkin/
│   │   │   ├── MoodSelector.jsx
│   │   │   ├── CheckinForm.jsx
│   │   │   └── CheckinHistory.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── WelcomeSection.jsx
│   │   │   └── QuickActions.jsx
│   │   ├── analytics/
│   │   │   ├── TrendChart.jsx
│   │   │   ├── RiskAlerts.jsx
│   │   │   └── DepartmentChart.jsx
│   │   └── rewards/
│   │       ├── RewardCard.jsx
│   │       ├── RewardCatalog.jsx
│   │       └── HappyCoinsDisplay.jsx
│   └── layout/
│       ├── Navigation.jsx
│       ├── Sidebar.jsx
│       └── Layout.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Onboarding.jsx
│   ├── employee/
│   │   ├── Dashboard.jsx
│   │   ├── Checkin.jsx
│   │   ├── Rewards.jsx
│   │   ├── Surveys.jsx
│   │   └── Profile.jsx
│   ├── hr/
│   │   ├── Analytics.jsx
│   │   ├── RiskManagement.jsx
│   │   ├── TeamOverview.jsx
│   │   └── Reports.jsx
│   └── admin/
│       ├── SystemSettings.jsx
│       ├── UserManagement.jsx
│       └── IntegrationSettings.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCheckin.js
│   ├── useAnalytics.js
│   ├── useRewards.js
│   └── useSurveys.js
├── services/
│   ├── api.js              # Main API client
│   ├── auth.service.js
│   ├── wellness.service.js
│   ├── analytics.service.js
│   └── rewards.service.js
├── store/
│   ├── authStore.js        # Authentication state
│   ├── wellnessStore.js    # Wellness data state
│   └── uiStore.js          # UI state (modals, etc.)
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   ├── dateUtils.js
│   └── formatters.js
└── styles/
    ├── globals.css
    ├── components.css
    └── animations.css
```

## API Integration Strategy

### 1. API Service Layer
```javascript
// services/api.js
class WellnessAPI {
  constructor() {
    this.baseURL = 'http://localhost:8005/api';
    this.token = localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Checkin methods
  async createCheckin(data) {
    return this.request('/checkins', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTodayCheckin() {
    return this.request('/checkins/today');
  }

  // Analytics methods
  async getCompanyOverview() {
    return this.request('/analytics/company-overview');
  }

  // Rewards methods
  async getRewards(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/rewards?${query}`);
  }
}

export const api = new WellnessAPI();
```

### 2. State Management with Zustand
```javascript
// store/authStore.js
import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { user, accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      api.token = accessToken;
      
      set({ user, token: accessToken, isAuthenticated: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
```

## Core Features Implementation

### 1. Daily Check-in Component
```jsx
// components/features/checkin/MoodSelector.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Very Low', color: 'text-red-500' },
  { value: 2, emoji: '😕', label: 'Low', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
  { value: 4, emoji: '😊', label: 'Good', color: 'text-green-500' },
  { value: 5, emoji: '😄', label: 'Great', color: 'text-emerald-500' }
];

export function MoodSelector({ value, onChange }) {
  return (
    <div className="flex justify-center gap-4 my-8">
      {MOODS.map((mood) => (
        <motion.button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={`
            flex flex-col items-center p-4 rounded-2xl transition-all
            ${value === mood.value 
              ? 'bg-primary/20 scale-110 shadow-lg' 
              : 'hover:bg-gray-50 hover:scale-105'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-4xl mb-2">{mood.emoji}</span>
          <span className={`text-sm font-medium ${mood.color}`}>
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
```

### 2. Premium Card Component
```jsx
// components/ui/Card.jsx
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export function Card({ 
  children, 
  className, 
  hover = true, 
  glass = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        glass 
          ? "bg-glass-bg backdrop-blur-xl border border-glass-border" 
          : "bg-white shadow-soft",
        hover && "hover:shadow-medium hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### 3. Navigation Component
```jsx
// components/layout/Navigation.jsx
import { useAuthStore } from '../../store/authStore';
import { Bell, Settings, User } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-xl font-semibold text-primary-dark">
              🌱 WellnessAI
            </div>
            <div className="hidden md:flex space-x-6">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/checkin">Check-in</NavLink>
              <NavLink to="/rewards">Rewards</NavLink>
              <NavLink to="/analytics">Analytics</NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Backend API Integration Map

### Priority Features
1. **Daily Check-in**: `POST /api/checkins` - Amy's #1 priority
2. **Today's Status**: `GET /api/checkins/today` - Check if already completed
3. **Pulse Surveys**: `GET /api/surveys/active` - Amy's #2 priority
4. **HR Analytics**: `GET /api/analytics/company-overview` - Amy's #3 priority
5. **Risk Alerts**: `GET /api/team/risk-assessment` - HR dashboard

### All Available Endpoints
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh

// Daily Check-ins (Priority #1)
POST /api/checkins
GET /api/checkins/today
GET /api/checkins?page=1&limit=10
GET /api/checkins/trend?period=30

// Surveys (Priority #2) 
GET /api/surveys/active
POST /api/surveys/{surveyId}/respond

// Analytics (Priority #3)
GET /api/analytics/company-overview
GET /api/analytics/department/{dept}
GET /api/team/overview
GET /api/team/mood-trend
GET /api/team/risk-assessment

// Rewards System
GET /api/rewards?category=wellness&page=1
POST /api/rewards/{rewardId}/redeem
GET /api/rewards/achievements/my-achievements

// AI Insights
GET /api/ai/insights
GET /api/ai/summary/weekly

// Challenges
GET /api/challenges/active
POST /api/challenges/{challengeId}/join

// Resources
GET /api/resources/categories
GET /api/resources/category/{category}
```

## Development Steps (7-Day Timeline)

### Day 1: Foundation Setup
- Install all dependencies
- Set up Tailwind config with custom colors
- Create basic project structure
- Implement API service layer
- Set up state management (Zustand)

### Day 2: Authentication & Layout
- Build login/register forms
- Create navigation component
- Implement authentication flow
- Set up protected routes
- Basic responsive layout

### Day 3: Daily Check-in (Amy's Priority #1)
- MoodSelector component with animations
- Check-in form with validation
- Integration with POST /api/checkins
- Today's status check (GET /api/checkins/today)
- Success animations and feedback

### Day 4: Dashboard & Analytics
- Employee dashboard with stats cards
- Chart components using Recharts
- HR analytics dashboard (Amy's Priority #3)
- Real-time data updates
- Risk alert notifications

### Day 5: Surveys & Rewards
- Weekly pulse surveys (Amy's Priority #2)
- Survey form with progress indicators
- Rewards catalog with filtering
- Happy Coins display and redemption
- Achievement badges

### Day 6: Polish & Optimization
- Smooth animations with Framer Motion
- Loading states and error handling
- Mobile responsiveness
- Performance optimization
- Edge case handling

### Day 7: Testing & Deployment
- Cross-browser testing
- Mobile device testing
- Final UI polish
- Deploy to Vercel/Netlify
- Client handover

## Next Steps
1. Run the installation commands
2. Set up Tailwind configuration
3. Begin with authentication and basic layout
4. Focus on Amy's priority features first
5. Test integration with existing backend API

The backend API is comprehensive and well-documented. The frontend will be a premium, professional interface that Amy will love!