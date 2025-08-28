import React from 'react';

/**
 * Consistent tab navigation component
 */
function TabNavigation({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={`flex space-x-1 bg-gray-100 p-1 rounded-xl ${className}`}>
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === id
              ? 'bg-white text-sage-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50'
          }`}
        >
          {Icon && <Icon size={18} />}
          <span>{label}</span>
          {count !== undefined && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === id 
                ? 'bg-sage-100 text-sage-700' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;