import React from 'react';
import { MessageSquareIcon, CheckCircle, XCircle } from 'lucide-react';

function SlackStatusBadge({ isConnected, showLabel = true, size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const iconSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-1.5">
        <div className="relative">
          <MessageSquareIcon 
            size={iconSize[size]} 
            className="text-sage-600"
          />
          <CheckCircle 
            size={iconSize[size] * 0.6} 
            className="absolute -bottom-1 -right-1 text-sage-600 bg-white rounded-full"
          />
        </div>
        {showLabel && (
          <span className="text-sm text-sage-600 font-medium">
            Slack Connected
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5">
      <div className="relative">
        <MessageSquareIcon 
          size={iconSize[size]} 
          className="text-gray-400"
        />
        <XCircle 
          size={iconSize[size] * 0.6} 
          className="absolute -bottom-1 -right-1 text-gray-400 bg-white rounded-full"
        />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-500">
          Slack Not Connected
        </span>
      )}
    </div>
  );
}

export default SlackStatusBadge;