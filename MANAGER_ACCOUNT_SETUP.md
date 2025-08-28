# Manager Super User Account Setup

## Account Details
- **Email**: banturide5@gmail.com
- **Password**: Milan18$
- **Role**: manager
- **Name**: Amy Manager

## Setup Instructions

### Option 1: Direct Database Insert (Recommended)
Navigate to your backend directory and run this script:

```javascript
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-app');

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'hr', 'admin', 'manager'], default: 'employee' },
  isEmailVerified: { type: Boolean, default: false },
  isOnboardingCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createManagerUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('Milan18$', 10);
    
    // Create manager user
    const manager = new User({
      name: 'Amy Manager',
      email: 'banturide5@gmail.com',
      password: hashedPassword,
      role: 'manager',
      isEmailVerified: true,
      isOnboardingCompleted: true
    });
    
    await manager.save();
    console.log('✅ Manager account created successfully!');
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  User already exists with this email');
    } else {
      console.error('❌ Error creating manager:', error.message);
    }
    process.exit(1);
  }
}

createManagerUser();
```

### Option 2: API Registration
If your backend server is running, use this curl command:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amy Manager", 
    "email": "banturide5@gmail.com",
    "password": "Milan18$",
    "role": "manager"
  }'
```

### Option 3: Frontend Registration
1. Go to the registration page in your frontend
2. Register with the provided credentials
3. Manually update the user role in the database to 'manager'

## Post-Setup Verification

After creating the account, you can login with:
- **Email**: banturide5@gmail.com
- **Password**: Milan18$

The manager will have access to:
- Complete platform overview dashboard
- User management for all roles (Manager, Admin, HR, Employee)
- System settings and analytics
- All SaaS owner capabilities

## Manager Features
- **Dashboard**: `/manager/dashboard` - Platform overview with comprehensive analytics
- **User Management**: `/manager/users` - Create/edit/delete all user types
- **HR Management**: `/manager/hr` - Manage HR staff
- **Employee Management**: `/manager/employees` - View team analytics
- **Platform Settings**: `/manager/settings` - System configuration
- **Analytics**: `/manager/analytics` - Advanced platform metrics (coming soon)

## Security Notes
- Manager role has the highest privileges in the system
- Can create other managers (for multi-manager SaaS setup)
- Has access to all platform data and user management
- Email verification and onboarding should be set to completed for immediate access