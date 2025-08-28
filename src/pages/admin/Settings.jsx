import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SettingsIcon,
  UsersIcon,
  GiftIcon,
  FileTextIcon,
  ShieldIcon,
  DatabaseIcon,
  MailIcon,
  AlertTriangleIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  XIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import TabNavigation from '../../components/shared/TabNavigation';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import api from '../../services/api';

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('surveys');
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'surveys':
          const surveysData = await api.getSurveys();
          setSurveys(surveysData.success ? surveysData.data.surveys : []);
          break;
        case 'rewards':
          const rewardsData = await api.getRewards();
          setRewards(rewardsData.success ? rewardsData.data.rewards : []);
          break;
        case 'challenges':
          const challengesData = await api.getActiveChallenges();
          setChallenges(challengesData.success ? challengesData.data.challenges : []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const renderSurveysTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pulse Surveys</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon size={16} />
          Create Survey
        </button>
      </div>

      {surveys.length > 0 ? (
        <div className="card-glass">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {surveys.map((survey) => (
                  <tr key={survey._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {survey.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {survey.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        survey.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : survey.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.responses?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setEditingItem(survey)}
                        className="text-sage-600 hover:text-sage-900"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete('survey', survey._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-glass text-center py-12">
          <FileTextIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Surveys Found</h3>
          <p className="text-gray-500 mb-4">Create your first pulse survey to gather employee feedback.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon size={16} />
            Create Survey
          </button>
        </div>
      )}
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Rewards Management</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon size={16} />
          Add Reward
        </button>
      </div>

      {rewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <motion.div
              key={reward._id}
              className="card-glass hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {reward.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {reward.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-medium text-sage-600">
                        {reward.coinsRequired} coins
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reward.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reward.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingItem(reward)}
                      className="text-sage-600 hover:text-sage-900 p-1"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete('reward', reward._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
                
                {reward.isLimited && (
                  <div className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                    Limited: {reward.quantity} remaining
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card-glass text-center py-12">
          <GiftIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Found</h3>
          <p className="text-gray-500 mb-4">Add rewards to motivate employee engagement.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon size={16} />
            Add Reward
          </button>
        </div>
      )}
    </div>
  );

  const renderChallengesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Wellness Challenges</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon size={16} />
          Create Challenge
        </button>
      </div>

      {challenges.length > 0 ? (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge._id} className="card-glass">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {challenge.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {challenge.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-gray-500">Participants:</span>
                        <span className="ml-1 font-medium">{challenge.participants?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{challenge.duration} days</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Reward:</span>
                        <span className="ml-1 font-medium text-sage-600">{challenge.reward} coins</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingItem(challenge)}
                      className="text-sage-600 hover:text-sage-900 p-1"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete('challenge', challenge._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-glass text-center py-12">
          <AlertTriangleIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Challenges Found</h3>
          <p className="text-gray-500 mb-4">Create wellness challenges to boost employee engagement.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon size={16} />
            Create Challenge
          </button>
        </div>
      )}
    </div>
  );

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      let result;
      switch (type) {
        case 'survey':
          result = await api.request(`/surveys/${id}`, { method: 'DELETE' });
          break;
        case 'reward':
          result = await api.request(`/rewards/${id}`, { method: 'DELETE' });
          break;
        case 'challenge':
          result = await api.request(`/challenges/${id}`, { method: 'DELETE' });
          break;
      }

      if (result.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'Success');
        loadData();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`, 'Error');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <PageHeader
        title="Admin Settings"
        subtitle="Manage surveys, rewards, challenges, and system settings"
        icon={SettingsIcon}
      />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={[
          { id: 'surveys', label: 'Surveys', icon: FileTextIcon },
          { id: 'rewards', label: 'Rewards', icon: GiftIcon },
          { id: 'challenges', label: 'Challenges', icon: AlertTriangleIcon },
          { id: 'users', label: 'Users', icon: UsersIcon },
          { id: 'system', label: 'System', icon: DatabaseIcon }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'surveys' && renderSurveysTab()}
      {activeTab === 'rewards' && renderRewardsTab()}
      {activeTab === 'challenges' && renderChallengesTab()}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <a
              href="/admin/users"
              className="btn-primary"
            >
              <UsersIcon size={16} />
              Manage Users
            </a>
          </div>
          
          <div className="card-glass">
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Manage user accounts, roles, and permissions from the dedicated User Management page.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <UsersIcon size={20} className="text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Create Users</h4>
                  </div>
                  <p className="text-sm text-gray-600">Add new employees to the system</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <EditIcon size={20} className="text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Edit Profiles</h4>
                  </div>
                  <p className="text-sm text-gray-600">Update user information and roles</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ShieldIcon size={20} className="text-purple-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Manage Permissions</h4>
                  </div>
                  <p className="text-sm text-gray-600">Control user access and roles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'system' && (
        <div className="card-glass text-center py-12">
          <DatabaseIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-500">System configuration features coming soon.</p>
        </div>
      )}
    </motion.div>
  );
}

export default AdminSettings;