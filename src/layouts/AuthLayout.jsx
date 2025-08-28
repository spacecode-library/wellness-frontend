import React from 'react';
import { motion } from 'framer-motion';

/**
 * Authentication Layout Component
 * Provides a centered layout for login, register, and onboarding pages
 */
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-sage-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-sage-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="wellness-pattern"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
              <circle cx="100" cy="100" r="50" fill="none" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="25" fill="none" strokeWidth="0.3" opacity="0.2" />
              <circle cx="150" cy="150" r="25" fill="none" strokeWidth="0.3" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#wellness-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div
            className="mx-auto w-16 h-16 bg-sage-300 rounded-2xl flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-white font-bold text-2xl">W</span>
          </motion.div>

          {/* App Name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WelldifyAI
          </h1>
          <p className="text-gray-600">
            AI-Powered Workplace Wellness Platform
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl px-8 py-10 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-sm text-gray-500">
            Empowering Workplace Wellness Through AI
          </p>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-sage-300 rounded-full opacity-60"
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-3 h-3 bg-sage-400 rounded-full opacity-40"
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-sage-200 rounded-full opacity-50"
          animate={{
            y: [0, -15, 0],
            opacity: [0.5, 0.25, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>
    </div>
  );
}

export default AuthLayout;