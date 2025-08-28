# Railway CORS Configuration Fix

## Issue
The backend deployed on Railway is blocking requests from the Vercel frontend due to CORS policy violation.

## Error Message
```
Access to XMLHttpRequest at 'https://wellness-backend-production-48b1.up.railway.app/api/auth/register' 
from origin 'https://wellness-frontend-mukela12-mukelas-projects.vercel.app' has been blocked by CORS policy
```

## Solution
Update the Railway environment variables to include the Vercel frontend URL in the allowed origins.

### Steps to Fix:

1. **Go to Railway Dashboard**
   - Navigate to https://railway.app
   - Select your wellness-backend project

2. **Update Environment Variables**
   - Go to the "Variables" tab
   - Find the `ALLOWED_ORIGINS` variable (or create it if it doesn't exist)
   - Update the value to include the Vercel frontend URL:

   ```
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://wellness-frontend-mukela12-mukelas-projects.vercel.app
   ```

3. **Redeploy the Backend**
   - After updating the environment variable, Railway should automatically redeploy
   - If not, trigger a manual redeploy

### Alternative: Update via Railway CLI
If you have Railway CLI installed:

```bash
railway login
railway link [your-project-id]
railway variables set ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000,https://wellness-frontend-mukela12-mukelas-projects.vercel.app"
```

### Verification
After the backend redeploys, test the CORS fix:

```bash
curl -X POST https://wellness-backend-production-48b1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://wellness-frontend-mukela12-mukelas-projects.vercel.app" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!","department":"Engineering","role":"employee"}' \
  -v
```

The response should no longer show "CORS policy violation".

## Current Status
- ✅ Frontend deployed to Vercel: https://wellness-frontend-mukela12-mukelas-projects.vercel.app
- ✅ Backend deployed to Railway: https://wellness-backend-production-48b1.up.railway.app
- ⚠️ CORS configuration needs update on Railway
- ⏳ Waiting for Railway environment variable update

## Next Steps
1. Update Railway environment variables as described above
2. Test full application functionality
3. Verify all features work correctly in production