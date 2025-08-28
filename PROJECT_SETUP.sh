#!/bin/bash

# WellnessAI Platform - Complete Project Setup Script
# This script sets up both backend and frontend repositories

echo "🚀 Setting up WellnessAI Platform..."

# Backend Setup
echo "📦 Setting up Backend..."
cd ..
mkdir wellness-backend
cd wellness-backend

# Initialize and install backend dependencies
npm init -y
npm install express mongoose dotenv cors helmet morgan compression
npm install jsonwebtoken bcryptjs express-validator express-rate-limit
npm install node-cron axios multer cloudinary
npm install openai @google-cloud/language twilio @sendgrid/mail
npm install -D nodemon @types/node eslint prettier eslint-config-prettier
npm install -D @babel/core @babel/preset-env @babel/node

# Create backend structure
mkdir -p src/{controllers,models,routes,middleware,services,utils,config}
mkdir -p src/services/{ai,whatsapp,analytics,notifications}

# Create essential backend files
cat > .env.example << EOL
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/wellness-ai

# JWT
JWT_SECRET=your-secret-key-here
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
EOL

cat > .gitignore << EOL
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
EOL

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ..
cd wellness-frontend

# Install frontend dependencies
npm install framer-motion @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-switch @radix-ui/react-slider
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react recharts date-fns
npm install react-hook-form zod @hookform/resolvers
npm install react-router-dom @tanstack/react-query zustand
npm install axios js-cookie
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier

# Create frontend structure
mkdir -p src/{components,pages,layouts,hooks,utils,services,store}
mkdir -p src/components/{ui,features,charts}
mkdir -p src/pages/{employee,hr,admin,auth}
mkdir -p src/styles

echo "✅ Project setup complete!"
echo "📋 Next steps:"
echo "1. Configure environment variables in both projects"
echo "2. Set up MongoDB database"
echo "3. Configure WhatsApp Business API"
echo "4. Start development servers"