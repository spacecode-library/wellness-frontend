import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X as XMarkIcon, 
  Users as UserGroupIcon, 
  Building2 as BuildingOffice2Icon,
  Search as MagnifyingGlassIcon,
  CheckCircle as CheckCircleIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon
} from 'lucide-react';
import ChannelSelector from '../integration/ChannelSelector';
import SlackStatusBadge from '../integration/SlackStatusBadge';
import { useToast } from '../shared/Toast';
import api from '../../services/api';

function SurveyDistributionModal({ isOpen, onClose, survey }) {
  const [selectedChannels, setSelectedChannels] = useState(['email']);
  const [recipientType, setRecipientType] = useState('all'); // all, department, individual
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [slackStats, setSlackStats] = useState(null);
  const [schedule, setSchedule] = useState({
    type: 'immediate', // immediate, scheduled
    date: '',
    time: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchUsers();
      fetchSlackStats();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments();
      if (response.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.getAllUsers({ limit: 1000 });
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchSlackStats = async () => {
    try {
      const response = await api.getIntegrationStats();
      if (response.success) {
        setSlackStats(response.data.slack);
      }
    } catch (error) {
      console.error('Failed to fetch Slack stats:', error);
    }
  };

  const getRecipientCount = () => {
    switch (recipientType) {
      case 'all':
        return users.filter(u => u.isActive).length;
      case 'department':
        return users.filter(u => u.isActive && selectedDepartments.includes(u.department)).length;
      case 'individual':
        return selectedUsers.length;
      default:
        return 0;
    }
  };

  const getSlackConnectedCount = () => {
    let targetUsers = [];
    
    switch (recipientType) {
      case 'all':
        targetUsers = users.filter(u => u.isActive);
        break;
      case 'department':
        targetUsers = users.filter(u => u.isActive && selectedDepartments.includes(u.department));
        break;
      case 'individual':
        targetUsers = users.filter(u => selectedUsers.includes(u._id));
        break;
    }
    
    return targetUsers.filter(u => u.integrations?.slack?.isConnected).length;
  };

  const handleDistribute = async () => {
    if (!survey) return;

    // Validate schedule
    if (schedule.type === 'scheduled' && (!schedule.date || !schedule.time)) {
      toast.error('Please select both date and time for scheduled distribution', 'Validation Error');
      return;
    }

    setLoading(true);
    try {
      const distributionData = {
        surveyId: survey._id,
        channels: selectedChannels,
        recipients: {
          type: recipientType,
          departments: selectedDepartments,
          userIds: selectedUsers
        },
        schedule: schedule.type === 'scheduled' ? {
          scheduledFor: new Date(`${schedule.date} ${schedule.time}`)
        } : null
      };

      const response = await api.distributeSurvey(survey._id, distributionData);
      
      if (response.success) {
        toast.success(
          `Survey distributed successfully to ${response.data.sentCount} recipients`, 
          'Success'
        );
        onClose();
      }
    } catch (error) {
      console.error('Failed to distribute survey:', error);
      toast.error(error.response?.data?.message || 'Failed to distribute survey', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Distribute Survey
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {survey?.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Distribution Channels */}
            <div className="mb-8">
              <ChannelSelector
                selectedChannels={selectedChannels}
                onChannelChange={setSelectedChannels}
                slackStats={{
                  connectedCount: getSlackConnectedCount(),
                  totalCount: getRecipientCount()
                }}
                recipientCount={getRecipientCount()}
              />
            </div>

            {/* Recipients Selection */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Select Recipients</h4>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <button
                  onClick={() => setRecipientType('all')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'all'
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-sage-600" />
                  <p className="font-medium">All Employees</p>
                  <p className="text-sm text-gray-600">{users.filter(u => u.isActive).length} recipients</p>
                </button>

                <button
                  onClick={() => setRecipientType('department')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'department'
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BuildingOffice2Icon className="w-8 h-8 mx-auto mb-2 text-sage-600" />
                  <p className="font-medium">By Department</p>
                  <p className="text-sm text-gray-600">Select departments</p>
                </button>

                <button
                  onClick={() => setRecipientType('individual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    recipientType === 'individual'
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-sage-600" />
                  <p className="font-medium">Individual</p>
                  <p className="text-sm text-gray-600">Select specific users</p>
                </button>
              </div>

              {/* Department Selection */}
              {recipientType === 'department' && (
                <div className="space-y-2">
                  {departments.map(dept => (
                    <label
                      key={dept}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartments([...selectedDepartments, dept]);
                          } else {
                            setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                          }
                        }}
                        className="w-4 h-4 text-sage-600 rounded focus:ring-sage-300"
                      />
                      <span className="font-medium">{dept}</span>
                      <span className="text-sm text-gray-600">
                        ({users.filter(u => u.isActive && u.department === dept).length} employees)
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Individual Selection */}
              {recipientType === 'individual' && (
                <div>
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredUsers.map(user => (
                      <label
                        key={user._id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="w-4 h-4 text-sage-600 rounded focus:ring-sage-300"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <SlackStatusBadge 
                          isConnected={user.integrations?.slack?.isConnected} 
                          showLabel={false}
                          size="xs"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Options */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Schedule</h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="schedule"
                    checked={schedule.type === 'immediate'}
                    onChange={() => setSchedule({ type: 'immediate', date: '', time: '' })}
                    className="w-4 h-4 text-sage-600"
                  />
                  <span className="font-medium">Send immediately</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="schedule"
                    checked={schedule.type === 'scheduled'}
                    onChange={() => setSchedule({ ...schedule, type: 'scheduled' })}
                    className="w-4 h-4 text-sage-600"
                  />
                  <span className="font-medium">Schedule for later</span>
                </label>
                
                {schedule.type === 'scheduled' && (
                  <div className="ml-7 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        value={schedule.date}
                        onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Time</label>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Distribution Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Recipients:</span>
                  <span className="font-medium">{getRecipientCount()}</span>
                </p>
                {selectedChannels.includes('slack') && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Slack Connected:</span>
                    <span className="font-medium text-green-600">{getSlackConnectedCount()}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-600">Channels:</span>
                  <span className="font-medium">{selectedChannels.join(', ')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium">
                    {schedule.type === 'immediate' ? 'Immediate' : `${schedule.date} at ${schedule.time}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDistribute}
                disabled={loading || getRecipientCount() === 0}
                className="px-6 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Distributing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Distribute Survey</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default SurveyDistributionModal;