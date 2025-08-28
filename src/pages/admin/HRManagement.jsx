import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users2Icon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  MailIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  UserCheckIcon,
  AlertTriangleIcon,
  CalendarIcon,
  FileTextIcon,
  BarChart3Icon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import UserManagementModal from '../../components/admin/UserManagementModal';
import api from '../../services/api';

function HRManagement() {
  const [hrUsers, setHrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedHR, setSelectedHR] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateHRModal, setShowCreateHRModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [hrStats, setHrStats] = useState({
    totalHR: 0,
    activeManagers: 0,
    recentActivity: 0,
    managedEmployees: 0
  });

  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadHRUsers();
    loadDepartments();
    loadHRStats();
  }, []);

  useEffect(() => {
    loadHRUsers();
  }, [searchTerm, departmentFilter, statusFilter]);

  const loadHRUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        role: 'hr', // Only HR users
        department: departmentFilter,
        status: statusFilter
      };

      const response = await api.getAllUsers(params);
      
      if (response.success && response.data.users) {
        setHrUsers(response.data.users);
      } else {
        setHrUsers([]);
        toast.error('Failed to load HR users', 'Error');
      }
    } catch (error) {
      console.error('Error loading HR users:', error);
      toast.error('Failed to load HR users', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.getDepartments();
      if (response.success && response.data.departments) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadHRStats = async () => {
    try {
      // Get HR users data
      const hrResponse = await api.getAllUsers({ role: 'hr', limit: 100 });
      
      // Get total employee count to show managed employees
      const employeeResponse = await api.getAllUsers({ role: 'employee', limit: 100 });
      
      if (hrResponse.success) {
        const allHRUsers = hrResponse.data.users;
        const activeHRUsers = allHRUsers.filter(hr => hr.isActive);
        
        // Calculate recent activity based on last login dates
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentlyActive = allHRUsers.filter(hr => 
          hr.lastLogin && new Date(hr.lastLogin) > oneWeekAgo
        ).length;
        
        setHrStats({
          totalHR: allHRUsers.length,
          activeManagers: activeHRUsers.length,
          recentActivity: recentlyActive,
          managedEmployees: employeeResponse.success ? employeeResponse.data.totalCount : 0
        });
      }
    } catch (error) {
      console.error('Error loading HR stats:', error);
    }
  };

  const handleToggleStatus = async (hrUser) => {
    try {
      const response = await api.toggleUserStatus(hrUser._id, !hrUser.isActive);
      if (response.success) {
        setHrUsers(prev => prev.map(hr => 
          hr._id === hrUser._id ? { ...hr, isActive: !hr.isActive } : hr
        ));
        toast.success(
          `HR ${hrUser.name} ${!hrUser.isActive ? 'activated' : 'deactivated'} successfully`,
          'Status Updated'
        );
        loadHRStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error toggling HR status:', error);
      toast.error('Failed to update HR status', 'Error');
    }
  };

  const handlePromoteToAdmin = async (hrUser) => {
    try {
      const response = await api.updateUserRole(hrUser._id, 'admin');
      if (response.success) {
        setHrUsers(prev => prev.filter(hr => hr._id !== hrUser._id));
        toast.success(`${hrUser.name} promoted to Admin successfully`, 'Role Updated');
        loadHRStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error promoting HR to admin:', error);
      toast.error('Failed to promote HR to admin', 'Error');
    }
  };

  const handleCreateHR = () => {
    setSelectedHR(null);
    setShowCreateHRModal(true);
  };

  const handleSaveHR = async (userData, existingUser) => {
    try {
      // Force role to be 'hr' for new users
      const hrUserData = existingUser ? userData : { ...userData, role: 'hr' };
      
      const response = existingUser
        ? await api.updateUser(existingUser._id, hrUserData)
        : await api.createUser(hrUserData);

      if (response.success) {
        toast.success(
          existingUser ? 'HR user updated successfully' : 'HR user created successfully',
          'Success'
        );
        setShowCreateHRModal(false);
        loadHRUsers();
        loadHRStats();
      }
    } catch (error) {
      console.error('Error saving HR user:', error);
      toast.error('Failed to save HR user', 'Error');
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return <LoadingState message="Loading HR management dashboard..." size="large" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <PageHeader
        title="HR Management"
        subtitle="Manage HR personnel, roles, and permissions across departments"
        icon={Users2Icon}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users2Icon size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hrStats.totalHR}</h3>
              <p className="text-gray-600 text-sm">Total HR Personnel</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheckIcon size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hrStats.activeManagers}</h3>
              <p className="text-gray-600 text-sm">Active HR Users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUpIcon size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hrStats.recentActivity}</h3>
              <p className="text-gray-600 text-sm">Active This Week</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BriefcaseIcon size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hrStats.managedEmployees}</h3>
              <p className="text-gray-600 text-sm">Total Employees</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card-glass p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search HR personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent w-64"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadHRUsers()}
              className="btn-secondary flex items-center space-x-2"
            >
              <FilterIcon size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* HR Personnel Table */}
      <div className="card-glass overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">HR Personnel</h3>
          <p className="text-gray-600 text-sm">Manage HR staff accounts and permissions</p>
        </div>
        
        {hrUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users2Icon size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No HR Personnel Found</h3>
            <p className="text-gray-600">No HR users match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HR Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hrUsers.map((hrUser, index) => (
                  <motion.tr
                    key={hrUser._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {hrUser.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {hrUser.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <MailIcon size={12} />
                            <span>{hrUser.email}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {hrUser.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {hrUser.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(hrUser.isActive)}`}>
                        {hrUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(hrUser.wellness?.riskLevel || 'low')}`}>
                          {(hrUser.wellness?.riskLevel || 'low').toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {hrUser.wellness?.happyCoins || 0} coins
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hrUser.lastLogin 
                        ? new Date(hrUser.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedHR(hrUser);
                            setShowCreateHRModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Edit HR User"
                        >
                          <EditIcon size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleStatus(hrUser)}
                          className={`p-2 rounded-lg transition-colors ${
                            hrUser.isActive 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={hrUser.isActive ? 'Deactivate HR' : 'Activate HR'}
                        >
                          {hrUser.isActive ? <ShieldXIcon size={16} /> : <ShieldCheckIcon size={16} />}
                        </button>
                        
                        <button
                          onClick={() => handlePromoteToAdmin(hrUser)}
                          className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                          title="Promote to Admin"
                        >
                          <TrendingUpIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-glass p-6 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create HR Account</h3>
          <p className="text-gray-600 text-sm mb-4">Add new HR personnel to the system</p>
          <button onClick={handleCreateHR} className="btn-primary">
            Add New HR
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-glass p-6 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3Icon size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">View HR performance and activity metrics</p>
          <button className="btn-secondary">
            View Analytics
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-glass p-6 text-center"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon size={32} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Reports</h3>
          <p className="text-gray-600 text-sm mb-4">Generate and export HR management reports</p>
          <button className="btn-secondary">
            Generate Report
          </button>
        </motion.div>
      </div>

      {/* User Management Modal for Creating HR */}
      <UserManagementModal
        isOpen={showCreateHRModal}
        onClose={() => setShowCreateHRModal(false)}
        user={selectedHR}
        onSave={handleSaveHR}
      />
    </motion.div>
  );
}

export default HRManagement;