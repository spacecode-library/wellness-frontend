# WelldifyAI Authentication Flow Documentation

## Overview
This document explains the complete authentication flow in the WelldifyAI frontend application, including registration, login, email verification, and role-based access control.

## 1. Registration Flow

### Frontend Components
- **Component**: `src/pages/auth/Register.jsx`
- **Store**: `src/store/authStore.js` - `register()` function
- **API**: `src/services/api.js` - `api.register()`

### Registration Process
1. **User Input**: User fills registration form with:
   - Full Name
   - Work Email
   - Employee ID
   - Department (dropdown)
   - Role (dropdown: employee, hr, admin)
   - Password & Confirmation

2. **Frontend Validation**: 
   - Name: 2-100 chars, letters/spaces/hyphens/apostrophes only
   - Employee ID: 3-20 chars, alphanumeric/hyphens/underscores only
   - Email: Valid email format
   - Password: Min 8 chars, uppercase, lowercase, number
   - Password confirmation match

3. **API Call**: POST `/api/auth/register`
   ```json
   {
     "name": "John Doe",
     "email": "john@company.com", 
     "password": "SecurePass123",
     "employeeId": "EMP001",
     "department": "Engineering",
     "role": "employee"
   }
   ```

4. **Backend Response**: 
   ```json
   {
     "success": true,
     "message": "Account created successfully! Please check your email to verify your account.",
     "data": {
       "user": { /* user object */ }
     }
   }
   ```

5. **Frontend Actions**:
   - Clear auth store state (`user: null, isAuthenticated: false`)
   - Navigate to `/login` with success message
   - Display success message on login page

### Fixed Issues
- **Problem**: After successful registration, form stayed empty and required refresh
- **Solution**: Navigate immediately without clearing form first, then clear form after navigation

## 2. Login Flow

### Frontend Components
- **Component**: `src/pages/auth/Login.jsx`
- **Store**: `src/store/authStore.js` - `login()` function
- **API**: `src/services/api.js` - `api.login()`

### Login Process
1. **User Input**: Email and password
2. **Frontend Validation**: Email format and password length
3. **API Call**: POST `/api/auth/login`
4. **Backend Response**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { /* user object */ },
       "accessToken": "jwt_token",
       "permissions": { /* role permissions */ },
       "accountStatus": {
         "needsEmailVerification": true/false,
         "needsOnboarding": true/false
       },
       "nextActions": [/* array of required actions */],
       "recommendedDashboard": "/role/dashboard"
     }
   }
   ```

5. **Frontend Actions**:
   - Store token in localStorage (via API service)
   - Update auth store with user data
   - Navigate based on account status

## 3. Email Verification Flow

### Components
- **Email Verification**: `src/pages/auth/EmailVerification.jsx`
- **Verification Prompt**: `src/pages/auth/EmailVerificationPrompt.jsx`

### Verification Process
1. **Registration Trigger**: Backend sends email with verification link
2. **Email Link**: Contains verification token `?token=abc123`
3. **Verification Page**: User clicks link, token is validated
4. **API Call**: GET `/api/auth/verify-email?token=abc123`
5. **Account Activation**: Backend marks `isEmailVerified: true`

### Verification States
- **Pending**: User registered but hasn't verified email
- **Success**: Email verified successfully
- **Expired**: Verification token expired
- **Invalid**: Invalid or malformed token

## 4. Route Protection System

### Route Types
1. **PublicRoute**: Login, Register, Password Reset (redirects if authenticated)
2. **ProtectedRoute**: Dashboard pages (requires authentication + role check)
3. **OnboardingRoute**: Onboarding flow (auth check only)

### Protection Logic
```javascript
// PublicRoute - redirects authenticated users
if (isAuthenticated) {
  if (needsEmailVerification) return <Navigate to="/verify-email-prompt" />;
  if (needsOnboarding) return <Navigate to="/onboarding" />;
  return <Navigate to={getRoleBasedDashboard(user?.role)} />;
}

// ProtectedRoute - requires auth + role
if (!isAuthenticated) return <Navigate to="/login" />;
if (needsEmailVerification) return <Navigate to="/verify-email-prompt" />;
if (needsOnboarding) return <Navigate to="/onboarding" />;
if (requiredRole && !hasRole(requiredRole)) return <Navigate to={roleDashboard} />;
```

## 5. Role-Based Access Control

### Roles Hierarchy
1. **Manager** (Super User - SaaS Owner)
   - Access: All platform features
   - Dashboard: `/manager/dashboard`
   - Can manage: All user types including other managers

2. **Admin** 
   - Access: HR + Admin features  
   - Dashboard: `/admin/dashboard`
   - Can manage: HR, Employees, System settings

3. **HR**
   - Access: Employee management, Analytics
   - Dashboard: `/hr/dashboard` 
   - Can manage: Employees, Surveys, Resources

4. **Employee**
   - Access: Personal wellness features
   - Dashboard: `/employee/dashboard`
   - Can manage: Own profile, check-ins, surveys

### Role-Based Routing
```javascript
function getRoleBasedDashboard(role) {
  switch (role) {
    case 'manager': return '/manager/dashboard';
    case 'admin': return '/admin/dashboard';
    case 'hr': return '/hr/dashboard';
    case 'employee': return '/employee/dashboard';
    default: return '/employee/dashboard';
  }
}
```

## 6. Authentication Store (Zustand)

### State Structure
```javascript
{
  user: null | UserObject,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: null | string,
  errorData: object,
  needsOnboarding: boolean,
  needsEmailVerification: boolean,
  permissions: object,
  nextActions: array
}
```

### Key Actions
- `login(credentials)` - Authenticate user
- `register(userData)` - Create new account
- `logout()` - Clear auth state
- `initializeAuth()` - Check existing token on app start
- `updateUser(userData)` - Update user profile

## 7. API Service Integration

### Token Management
- **Storage**: localStorage via `js-cookie`
- **Headers**: Automatic Bearer token injection
- **Interceptors**: Request/Response handling
- **Refresh**: Token refresh on 401 errors

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

## 8. Success Flows

### Successful Registration → Login
1. User registers successfully
2. Navigated to login with success message
3. Green success banner shows: "Registration successful! Please check your email to verify your account before logging in."
4. User can attempt login (will be prompted for email verification if needed)

### Successful Login (Email Verified)
1. User logs in with verified account
2. Redirected to role-based dashboard
3. Navigation shows role-appropriate menu items

### Successful Login (Email Not Verified)
1. User logs in with unverified account
2. Redirected to email verification prompt
3. Can resend verification email or logout

## 9. Error Handling

### Registration Errors
- **Validation**: Field-specific error messages
- **Duplicate Email**: "Email already exists"
- **Network**: Generic error message

### Login Errors  
- **Invalid Credentials**: "Please check your email and password"
- **Email Verification**: Shows resend verification option
- **Network**: Connection error message

## 10. Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- Real-time validation feedback

### Token Security
- JWT tokens with expiration
- Automatic token refresh
- Secure HTTP-only cookies (if configured)
- Token validation on protected routes

## 11. User Experience Features

### Loading States
- Form submission loading spinners
- Button disabled states during API calls
- Loading screens for auth initialization

### Form Validation
- Real-time validation feedback
- Password strength indicators
- Clear error messages
- Accessibility support

### Smooth Transitions
- Framer Motion animations
- Success message transitions
- Route change animations
- Form state transitions

This authentication system provides a secure, user-friendly experience with proper error handling, role-based access control, and email verification workflow.