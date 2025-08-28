import React from 'react';
import { MailIcon, MessageSquareIcon, Users } from 'lucide-react';

function ChannelSelector({ 
  selectedChannels, 
  onChannelChange, 
  slackStats = null,
  recipientCount = 0 
}) {
  const channels = [
    {
      id: 'email',
      name: 'Email',
      icon: MailIcon,
      description: 'Traditional email distribution',
      alwaysEnabled: true
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquareIcon,
      description: 'Direct message via Slack',
      requiresConnection: true
    }
  ];

  const handleChannelToggle = (channelId) => {
    if (channelId === 'email') return; // Email is always required
    
    const newChannels = selectedChannels.includes(channelId)
      ? selectedChannels.filter(id => id !== channelId)
      : [...selectedChannels, channelId];
    
    onChannelChange(newChannels);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Distribution Channels</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map(channel => {
          const isSelected = selectedChannels.includes(channel.id);
          const isDisabled = channel.alwaysEnabled;
          
          return (
            <div
              key={channel.id}
              className={`
                relative border-2 rounded-xl p-4 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-sage-500 bg-sage-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isDisabled ? 'cursor-not-allowed opacity-75' : ''}
              `}
              onClick={() => !isDisabled && handleChannelToggle(channel.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-sage-500 text-white' : 'bg-gray-100 text-gray-500'}
                `}>
                  <channel.icon size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{channel.name}</h5>
                    {isDisabled && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {channel.description}
                  </p>
                  
                  {channel.id === 'slack' && slackStats && (
                    <div className="mt-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-500">
                        <span>Connected users:</span>
                        <span className="font-medium">
                          {slackStats.connectedCount || 0} / {recipientCount}
                        </span>
                      </div>
                      {slackStats.connectedCount > 0 && (
                        <div className="bg-sage-100 text-sage-700 rounded px-2 py-1">
                          {slackStats.connectedCount} will receive via Slack
                        </div>
                      )}
                      {recipientCount - slackStats.connectedCount > 0 && isSelected && (
                        <div className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">
                          {recipientCount - slackStats.connectedCount} will receive via email only
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Selection indicator */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                disabled={isDisabled}
                className="absolute top-4 right-4 w-5 h-5 text-sage-600 rounded focus:ring-sage-300"
              />
            </div>
          );
        })}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
        <Users size={16} className="text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-900 font-medium">Distribution Note</p>
          <p className="text-blue-700">
            Surveys will be sent via Slack to connected users when available. 
            Users without Slack will receive surveys via email.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChannelSelector;