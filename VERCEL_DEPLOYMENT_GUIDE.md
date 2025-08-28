# WelldifyAI Frontend - Vercel Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy the WelldifyAI frontend application to Vercel, ensuring it connects properly to the production backend on Railway.

## Prerequisites
- Node.js 18+ installed locally
- Git repository with the latest code
- Vercel account (free tier is sufficient)
- Backend deployed and running on Railway

## Pre-Deployment Setup

### 1. Environment Configuration
Ensure your `.env` file contains the production settings:

```env
VITE_API_URL=https://wellness-backend-production-48b1.up.railway.app/api
VITE_APP_NAME=WelldifyAI
VITE_NODE_ENV=production
```

### 2. Build and Test Locally
```bash
# Install dependencies
npm install

# Test the build process
npm run build

# Preview the production build locally
npm run preview
```

### 3. Verify Backend Connectivity
Test that the frontend can connect to the backend:
```bash
# Test registration endpoint
curl -X POST "https://wellness-backend-production-48b1.up.railway.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@company.com",
    "password": "Test123456",
    "employeeId": "TEST001",
    "department": "Engineering",
    "role": "employee"
  }'
```

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

#### 1. Push to GitHub
```bash
git add .
git commit -m "Production ready: Updated API endpoints and branding"
git push origin main
```

#### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project settings

#### 3. Project Configuration
```json
{
  "name": "welldifyai-frontend",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "nodeVersion": "18.x"
}
```

#### 4. Environment Variables
Add these environment variables in Vercel:
- `VITE_API_URL`: `https://wellness-backend-production-48b1.up.railway.app/api`
- `VITE_APP_NAME`: `WelldifyAI`
- `VITE_NODE_ENV`: `production`

### Method 2: Vercel CLI

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login and Deploy
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 3. Configure Environment Variables
```bash
# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://wellness-backend-production-48b1.up.railway.app/api

vercel env add VITE_APP_NAME production
# Enter: WelldifyAI

vercel env add VITE_NODE_ENV production
# Enter: production
```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)
If you have a custom domain:
```bash
vercel domains add your-domain.com
vercel alias set your-vercel-app.vercel.app your-domain.com
```

### 2. Performance Optimization
The application is already optimized with:
- Code splitting via Vite
- Tree shaking for smaller bundles
- Lazy loading for routes
- Image optimization
- Gzip compression (handled by Vercel)

### 3. Security Headers
Add to `vercel.json` for enhanced security:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Testing Deployed Application

### 1. Core Functionality Tests
After deployment, test these critical flows:

#### User Registration
1. Go to `/register`
2. Fill out the form with valid data
3. Select role (employee, hr, or admin)
4. Verify successful registration

#### User Login
1. Go to `/login`
2. Use credentials from registration
3. Verify redirect to dashboard or onboarding

#### Daily Check-in
1. Navigate to `/checkin`
2. Complete all wellness metrics:
   - Mood (1-5)
   - Energy Level (1-5)
   - Stress Level (1-5)
   - Sleep Quality (1-5)
   - Workload (1-5)
   - Optional activities and comments
3. Verify Happy Coins are awarded

#### Onboarding Flow
1. New users should see onboarding
2. Complete all 4 sections:
   - Demographics
   - Wellness Baseline
   - Preferences
   - Support & Resources
3. Verify completion and redirect to dashboard

### 2. Role-Based Access Testing
- **Employee**: Can access dashboard, check-in, surveys, rewards, challenges, resources, profile
- **HR**: Additional access to HR analytics
- **Admin**: Additional access to admin settings and user management

### 3. API Integration Verification
All features should connect to the Railway backend:
- Authentication flows
- Check-in submissions
- Rewards display
- Analytics data
- User profile management

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Verify environment variables are set
vercel env ls

# Redeploy if variables were added after deployment
vercel --prod
```

#### 2. API Connection Issues
- Verify backend is running on Railway
- Check CORS settings on backend
- Ensure API URL is correct (with `/api` suffix)

#### 3. Build Failures
```bash
# Check build logs
vercel logs <deployment-url>

# Test build locally
npm run build
```

#### 4. Routing Issues (404 on refresh)
Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Monitoring & Maintenance

### 1. Performance Monitoring
- Use Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Check error rates and user experience

### 2. Automatic Deployments
With GitHub integration:
- Main branch deploys to production automatically
- Preview deployments for pull requests
- Rollback capabilities through Vercel dashboard

### 3. Backup Strategy
- GitHub repository serves as source code backup
- Vercel maintains deployment history
- Environment variables should be documented

## Success Verification Checklist

- [ ] Application builds successfully
- [ ] Environment variables are configured
- [ ] Frontend connects to Railway backend
- [ ] User registration works
- [ ] User login and authentication work
- [ ] Check-in flow completes successfully
- [ ] Happy Coins system functions
- [ ] Role-based access control works
- [ ] Onboarding flow completes
- [ ] All branding shows "WelldifyAI"
- [ ] No console errors in production
- [ ] Mobile responsiveness verified
- [ ] Performance metrics are acceptable

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **React Router Documentation**: https://reactrouter.com/
- **Backend API**: https://wellness-backend-production-48b1.up.railway.app/api
- **Backend Health Check**: https://wellness-backend-production-48b1.up.railway.app/health

---

**Deployment Status**: ✅ Ready for Production  
**Last Updated**: July 27, 2025  
**Frontend Version**: 1.0.0  
**Backend Compatibility**: ✅ Compatible with Railway deployment