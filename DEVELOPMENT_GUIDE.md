# WellnessAI Platform - Complete Development Guide

## Project Overview
- **Client**: Amy Au
- **Budget**: $1,500 (Fixed)
- **Timeline**: 7 Days (July 23-30, 2025)
- **Tech Stack**: React.js + Node.js + MongoDB + WhatsApp Business API

## Priority Features (Must Have)
1. **Daily Wellbeing Check-in (1-5 scale)**
   - Web interface + WhatsApp delivery
   - Mood tracking with optional feedback
   - Happy Coins reward system

2. **Weekly Pulse Questions**
   - 3 questions via web + WhatsApp
   - AI-powered sentiment analysis
   - Automated scheduling

3. **HR Insight Dashboard**
   - Mental health risk flagging
   - Productivity & engagement metrics
   - Real-time alerts via WhatsApp
   - Department-level analytics

## Design Requirements
### Color Palette (Client Approved)
- Primary: Pastel Mint Green `#add0b3`
- Text: Charcoal Grey `#3C4142` / Black `#000000`
- Background: Pure White `#FFFFFF`
- Secondary: Light Grey `#F5F5F7` (Apple-inspired)
- Accent: Soft Blue `#007AFF` (iOS blue)
- Success: Soft Green `#34C759`
- Warning: Soft Orange `#FF9500`
- Danger: Soft Red `#FF3B30`

### Design Principles
- **Apple-Inspired**: Clean, minimalist, intuitive
- **Premium Feel**: Smooth animations, subtle shadows, glass morphism
- **Information Hierarchy**: Clear visual structure
- **Responsive**: Mobile-first design
- **Accessibility**: WCAG 2.1 AA compliant

## Project Setup Commands

### Backend Setup (Node.js + Express + MongoDB)
```bash
# Create backend directory
mkdir wellness-backend
cd wellness-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express mongoose dotenv cors helmet morgan compression
npm install jsonwebtoken bcryptjs express-validator express-rate-limit
npm install node-cron axios multer cloudinary

# Install AI/API integrations
npm install openai @google-cloud/language twilio @sendgrid/mail

# Install development dependencies
npm install -D nodemon @types/node eslint prettier eslint-config-prettier
npm install -D @babel/core @babel/preset-env @babel/node

# Create project structure
mkdir -p src/{controllers,models,routes,middleware,services,utils,config}
mkdir -p src/services/{ai,whatsapp,analytics,notifications}

# Create essential files
touch .env .env.example .gitignore
touch src/server.js src/app.js
touch src/config/{database.js,constants.js}
```

### Frontend Setup (React.js + Modern UI)
```bash
# Create frontend with Vite (faster than CRA)
npm create vite@latest wellness-frontend -- --template react
cd wellness-frontend

# Install UI/Design dependencies
npm install framer-motion @radix-ui/react-* 
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react recharts date-fns
npm install react-hook-form zod @hookform/resolvers

# Install routing and state management
npm install react-router-dom @tanstack/react-query zustand
npm install axios js-cookie

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install development tools
npm install -D @types/react @types/react-dom
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier

# Create project structure
mkdir -p src/{components,pages,layouts,hooks,utils,services,store}
mkdir -p src/components/{ui,features,charts}
mkdir -p src/pages/{employee,hr,admin,auth}
mkdir -p src/styles
```

## Backend File Structure
```
wellness-backend/
├── .env
├── .gitignore
├── package.json
├── src/
│   ├── server.js           # Server entry point
│   ├── app.js             # Express app configuration
│   ├── config/
│   │   ├── database.js    # MongoDB connection
│   │   ├── constants.js   # App constants
│   │   └── whatsapp.js    # WhatsApp config
│   ├── models/
│   │   ├── User.js        # User schema
│   │   ├── CheckIn.js     # Daily check-in schema
│   │   ├── Survey.js      # Weekly survey schema
│   │   ├── Reward.js      # Rewards schema
│   │   └── Analytics.js   # Analytics data schema
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── checkin.controller.js
│   │   ├── survey.controller.js
│   │   ├── rewards.controller.js
│   │   └── analytics.controller.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── hr.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── ai/
│   │   │   ├── openai.service.js
│   │   │   └── sentiment.service.js
│   │   ├── whatsapp/
│   │   │   ├── client.js
│   │   │   └── templates.js
│   │   ├── analytics/
│   │   │   ├── risk.service.js
│   │   │   └── metrics.service.js
│   │   └── notifications/
│   │       └── scheduler.js
│   └── utils/
│       ├── logger.js
│       └── helpers.js
```

## Frontend File Structure
```
wellness-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Onboarding.jsx
│   │   ├── employee/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CheckIn.jsx
│   │   │   ├── Journal.jsx
│   │   │   └── Rewards.jsx
│   │   ├── hr/
│   │   │   ├── Analytics.jsx
│   │   │   ├── RiskAlerts.jsx
│   │   │   └── Reports.jsx
│   │   └── admin/
│   │       └── Settings.jsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   ├── features/
│   │   │   ├── MoodSelector.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── ActivityFeed.jsx
│   │   │   └── RewardCard.jsx
│   │   └── charts/
│   │       ├── TrendChart.jsx
│   │       └── DepartmentChart.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCheckIn.js
│   │   └── useAnalytics.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   └── wellness.service.js
│   └── store/
│       ├── authStore.js
│       └── wellnessStore.js
```

## Key Implementation Details

### 1. Daily Check-in Flow
```javascript
// Backend: CheckIn Model
const checkInSchema = {
  userId: ObjectId,
  date: Date,
  mood: { type: Number, min: 1, max: 5, required: true },
  feedback: String,
  happyCoinsEarned: Number,
  riskScore: Number, // AI-calculated
  timestamp: { type: Date, default: Date.now }
};

// WhatsApp Integration
const sendDailyCheckIn = async (phoneNumber) => {
  const message = {
    type: 'interactive',
    body: 'How are you feeling today?',
    action: {
      buttons: [
        { id: 'mood_1', title: '😔 1' },
        { id: 'mood_2', title: '😕 2' },
        { id: 'mood_3', title: '😐 3' },
        { id: 'mood_4', title: '😊 4' },
        { id: 'mood_5', title: '😄 5' }
      ]
    }
  };
  // Send via WhatsApp Business API
};
```

### 2. Mental Health Risk Detection
```javascript
// Risk calculation algorithm
const calculateRiskScore = async (userId) => {
  const recentCheckIns = await CheckIn.find({ userId })
    .sort({ date: -1 })
    .limit(7);
  
  const factors = {
    avgMood: calculateAverage(recentCheckIns.map(c => c.mood)),
    consecutiveLowDays: countConsecutiveLowMood(recentCheckIns),
    sentimentScore: await analyzeSentiment(recentCheckIns)
  };
  
  // Flag if avg mood < 2.5 for 3+ days
  if (factors.avgMood < 2.5 && factors.consecutiveLowDays >= 3) {
    await notifyHR(userId, 'HIGH_RISK');
  }
};
```

### 3. UI Component Example (Apple-Inspired)
```jsx
// Premium Card Component with Glass Morphism
const Card = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/80 backdrop-blur-xl",
        "rounded-2xl shadow-xl shadow-black/5",
        "border border-white/20",
        "p-6 transition-all duration-300",
        "hover:shadow-2xl hover:shadow-black/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/login` - Employee login
- `POST /api/auth/onboarding` - Complete onboarding questionnaire
- `POST /api/auth/refresh` - Refresh JWT token

### Employee Endpoints
- `POST /api/checkin` - Submit daily check-in
- `GET /api/checkin/history` - Get check-in history
- `POST /api/survey/response` - Submit weekly survey
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/redeem` - Redeem reward
- `GET /api/dashboard` - Get dashboard data

### HR Endpoints
- `GET /api/hr/analytics` - Get company-wide analytics
- `GET /api/hr/risk-alerts` - Get flagged employees
- `GET /api/hr/department/:id` - Department analytics
- `POST /api/hr/intervention` - Log intervention

### WhatsApp Webhook
- `POST /api/whatsapp/webhook` - Receive WhatsApp messages
- `POST /api/whatsapp/status` - Message status updates

## Database Schema Examples

### User Schema
```javascript
{
  _id: ObjectId,
  employeeId: String,
  name: String,
  email: String,
  phone: String,
  department: String,
  role: ['employee', 'hr', 'admin'],
  onboardingComplete: Boolean,
  onboardingAnswers: Object,
  mbtiType: String,
  happyCoins: { type: Number, default: 0 },
  riskLevel: ['low', 'medium', 'high'],
  createdAt: Date
}
```

### Check-in Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  mood: Number, // 1-5
  feedback: String,
  source: ['web', 'whatsapp'],
  happyCoinsEarned: Number,
  sentimentScore: Number, // -1 to 1
  keywords: [String], // AI extracted
  riskIndicators: [String],
  createdAt: Date
}
```

## Environment Variables (.env)
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# APIs
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# WhatsApp
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_WEBHOOK_TOKEN=...

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## Development Timeline

### Day 1-2: Foundation
- Set up repositories and project structure
- Configure MongoDB schemas
- Implement JWT authentication
- Create basic API endpoints
- Set up React with Tailwind

### Day 3-4: Core Features
- Build daily check-in system
- Implement WhatsApp integration
- Create mood tracking UI
- Develop Happy Coins system
- Build employee dashboard

### Day 5-6: Analytics & AI
- Integrate OpenAI for personalization
- Implement risk detection algorithm
- Build HR analytics dashboard
- Create real-time notifications
- Add survey functionality

### Day 7: Polish & Deploy
- UI refinements and animations
- Testing and bug fixes
- Deploy to Railway (backend)
- Deploy to Vercel (frontend)
- Final client testing

## Key Design Patterns

### 1. Component Architecture
- Use compound components for complex UI
- Implement render props for flexibility
- Create reusable hooks for business logic

### 2. State Management
- Zustand for global state (simple, performant)
- React Query for server state
- Local state for UI-only concerns

### 3. API Design
- RESTful endpoints with consistent naming
- Proper HTTP status codes
- Pagination for large datasets
- Rate limiting for protection

### 4. Security Best Practices
- JWT with refresh tokens
- Input validation on all endpoints
- XSS protection
- Rate limiting
- CORS configuration

## Testing Approach
- Unit tests for risk algorithms
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing for WhatsApp integration

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] WhatsApp webhook verified
- [ ] SSL certificates active
- [ ] Error monitoring setup
- [ ] Analytics tracking enabled
- [ ] Backup strategy implemented