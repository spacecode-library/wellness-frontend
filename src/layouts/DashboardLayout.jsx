import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  HeartIcon, 
  BarChart3, 
  GiftIcon, 
  Target,
  BookOpenIcon,
  PenToolIcon,
  TrophyIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  BellIcon,
  SettingsIcon,
  Users2Icon,
  UsersIcon
} from 'lucide-react';

// Store imports
import useAuthStore from '../store/authStore';
import useWellnessStore from '../store/wellnessStore';

// Component imports
import { cn } from '../utils/cn';
import NotificationDropdown from '../components/shared/NotificationDropdown';

/**
 * Role-specific Navigation Items
 */
const getNavigationItems = (userRole) => {
  // Employee-specific navigation
  if (userRole === 'employee') {
    return [
      { name: 'Dashboard', href: '/employee/dashboard', icon: HomeIcon },
      { name: 'Check-in', href: '/employee/checkin', icon: HeartIcon },
      { name: 'Surveys', href: '/employee/surveys', icon: BarChart3 },
      { name: 'Rewards', href: '/employee/rewards', icon: GiftIcon },
      { name: 'Challenges', href: '/employee/challenges', icon: Target },
      { name: 'Resources', href: '/employee/resources', icon: BookOpenIcon },
      { name: 'Journal', href: '/employee/journal', icon: PenToolIcon },
      { name: 'Leaderboard', href: '/employee/leaderboard', icon: TrophyIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ];
  }

  // HR-specific navigation
  if (userRole === 'hr') {
    return [
      { name: 'HR Dashboard', href: '/hr/dashboard', icon: HomeIcon },
      { name: 'Analytics', href: '/hr/analytics', icon: BarChart3 },
      { name: 'Employee Management', href: '/hr/employees', icon: Users2Icon },
      { name: 'Resource Management', href: '/hr/resources', icon: BookOpenIcon },
      { name: 'Challenge Management', href: '/hr/challenges', icon: Target },
      { name: 'Survey Management', href: '/hr/surveys', icon: BarChart3 },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ];
  }

  // Admin-specific navigation
  if (userRole === 'admin') {
    return [
      { name: 'Admin Dashboard', href: '/admin/dashboard', icon: HomeIcon },
      { name: 'User Management', href: '/admin/users', icon: UsersIcon },
      { name: 'HR Management', href: '/admin/hr-management', icon: Users2Icon },
      { name: 'Resource Management', href: '/admin/resources', icon: BookOpenIcon },
      { name: 'Challenge Management', href: '/admin/challenges', icon: Target },
      { name: 'Survey Management', href: '/admin/surveys', icon: BarChart3 },
      { name: 'Reward Management', href: '/admin/rewards', icon: GiftIcon },
      { name: 'Platform Settings', href: '/admin/settings', icon: SettingsIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ];
  }

  // Fallback for unknown roles
  return [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];
};

/**
 * Mobile Navigation Component
 */
function MobileNav({ isOpen, onClose, navigationItems, currentPath }) {
  const { logout } = useAuthStore();
  const { todayCheckIn } = useWellnessStore();
  const navigate = useNavigate();
  
  const hasCheckedInToday = !!todayCheckIn;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Mobile menu */}
          <motion.div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 lg:hidden"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-sage-300 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">WelldifyAI</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = currentPath === item.href;
                  const isCheckinItem = item.href === '/employee/checkin';
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 relative',
                        isActive
                          ? 'bg-sage-100 text-sage-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      
                      {/* Check-in indicator */}
                      {isCheckinItem && (
                        <div className={cn(
                          'ml-auto w-2 h-2 rounded-full flex-shrink-0',
                          hasCheckedInToday ? 'bg-green-400' : 'bg-orange-400'
                        )} />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
                >
                  <LogOutIcon size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Header Component
 */
function Header({ onMenuClick, user }) {

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and mobile menu button */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200 lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MenuIcon size={20} />
            </motion.button>
            
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold gradient-text">WelldifyAI</span>
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <NotificationDropdown />
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-sage-600 capitalize font-medium">{user?.role}</p>
              </div>
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {user?.name?.charAt(0)}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Sidebar Component
 */
function Sidebar({ navigationItems, currentPath }) {
  const { logout, user } = useAuthStore();
  const { todayCheckIn } = useWellnessStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const hasCheckedInToday = !!todayCheckIn;

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white/95 lg:backdrop-blur-xl lg:border-r lg:border-gray-200/50 lg:shadow-xl lg:h-screen">
      {/* Logo */}
      <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">WelldifyAI</h1>
            <p className="text-xs text-gray-500 font-medium">
              {user?.role === 'admin' ? 'Admin Portal' : 
               user?.role === 'hr' ? 'HR Portal' : 
               'Employee Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-sage-600 capitalize font-medium">{user?.role}</p>
          </div>
        </div>
        
        {/* Happy Coins Display */}
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-sage-50 to-sage-100 rounded-lg border border-sage-200/50">
          <span className="text-xs font-semibold text-gray-700">Happy Coins</span>
          <span className="text-xs font-bold text-sage-600 flex items-center space-x-1">
            <span>🪙</span>
            <span>{user?.wellness?.happyCoins || 0}</span>
          </span>
        </div>
      </div>

      {/* Navigation - with scrolling */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.href;
          const isCheckinItem = item.href === '/employee/checkin';
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative',
                isActive
                  ? 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon 
                size={18} 
                className={cn(
                  'mr-3 flex-shrink-0',
                  isActive ? 'text-sage-700' : 'text-gray-400 group-hover:text-gray-500'
                )} 
              />
              <span className="truncate">{item.name}</span>
              
              {/* Check-in indicator */}
              {isCheckinItem && (
                <div className={cn(
                  'ml-auto w-2 h-2 rounded-full flex-shrink-0',
                  hasCheckedInToday ? 'bg-green-400' : 'bg-orange-400'
                )} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section - Always visible */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
        >
          <LogOutIcon size={18} className="mr-3 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Dashboard Layout Component
 */
function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const navigationItems = getNavigationItems(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar */}
      <Sidebar 
        navigationItems={navigationItems} 
        currentPath={location.pathname} 
      />

      {/* Mobile navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={navigationItems}
        currentPath={location.pathname}
      />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setMobileMenuOpen(true)}
          user={user}
        />

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-[calc(100vh-4rem)] pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;