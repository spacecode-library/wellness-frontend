import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Key,
  Download,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserPlus,
  Building2,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Crown,
  Settings
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/shared/Toast';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import Modal from '../../components/shared/Modal';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import PromptModal from '../../components/shared/PromptModal';
import useConfirmation from '../../hooks/useConfirmation';
import usePrompt from '../../hooks/usePrompt';

function ManagerUserManagement() {
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: '',
    riskLevel: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    role: '',
    employment: {
      jobTitle: '',
      startDate: '',
      manager: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();
  const confirmation = useConfirmation();
  const promptModal = usePrompt();

  // All departments and roles that managers can assign
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Design', 'Management'];
  const roles = ['employee', 'manager', 'hr', 'admin'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];

  useEffect(() => {
    loadDashboardStats();
    loadUsers();
  }, [filters, pagination.currentPage, searchTerm, sortBy, sortOrder]);

  const loadDashboardStats = async () => {
    try {
      // Use the same endpoint as employee management but get all users
      const response = await api.getEmployeeDashboardSummary();
      if (response.success) {
        setDashboardStats({
          ...response.data,
          // Add manager-specific stats
          totalManagers: users.filter(u => u.role === 'manager').length,
          totalAdmins: users.filter(u => u.role === 'admin').length,
          totalHR: users.filter(u => u.role === 'hr').length
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Build params object, only including non-empty values
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };
      
      // Only add search if it has a value
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Only add filters that have values
      if (filters.department) params.department = filters.department;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.riskLevel) params.riskLevel = filters.riskLevel;

      console.log('🔍 MANAGER DEBUG - Final params:', params);
      
      // Use getAllUsers instead of getAllEmployees to get all user types
      const response = await api.getAllUsers(params);
      if (response.success) {
        setUsers(response.data.users || response.data.employees || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleViewDetails = async (userId) => {
    try {
      // Try to get detailed user info, fallback to list data
      const user = users.find(u => u._id === userId);
      if (user) {
        setSelectedUser({
          ...user,
          wellness: user.wellness || { riskLevel: 'low' },
          stats: user.stats || { checkIns: { totalCheckIns: 0, averageMood: 0 }, surveys: { totalResponses: 0 } }
        });
        setShowDetailsModal(true);
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.employeeId) errors.employeeId = 'Employee ID is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.role) errors.role = 'Role is required';
    if (!showEditModal && !formData.password) errors.password = 'Password is required';
    else if (!showEditModal && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const response = await api.createUser(formData);
      if (response.success) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          employeeId: '',
          department: '',
          role: '',
          employment: {
            jobTitle: '',
            startDate: '',
            manager: ''
          }
        });
        loadUsers();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const updateData = { ...formData };
      delete updateData.password; // Don't send password on update
      delete updateData.email; // Email cannot be updated
      
      const response = await api.updateUser(selectedUser._id, updateData);
      if (response.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        loadUsers();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirmation.confirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      type: 'danger'
    });
    
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        loadUsers();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      const response = await api.toggleUserStatus(userId, newStatus);
      if (response.success) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      employeeId: user.employeeId,
      department: user.department,
      role: user.role,
      employment: user.employment || {
        jobTitle: '',
        startDate: '',
        manager: ''
      }
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeId: '',
      department: '',
      role: 'employee',
      employment: {
        jobTitle: '',
        startDate: '',
        manager: ''
      }
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return 'text-red-600 bg-red-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'hr': return 'text-blue-600 bg-blue-100';
      case 'employee': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return Crown;
      case 'admin': return Shield;
      case 'hr': return Building2;
      case 'employee': return Users;
      default: return Users;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && users.length === 0) {
    return <LoadingState message="Loading platform users..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform User Management"
        subtitle="Manage all users across your SaaS platform"
        icon={Users}
      />

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalManagers || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">HR Staff</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalHR || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalAdmins || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview?.totalEmployees || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Activity size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.overview?.activeEmployees || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, employee ID, or job title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="col-span-3 cursor-pointer hover:text-gray-700 flex items-center space-x-1"
                  onClick={() => handleSort('name')}
                >
                  <span>User</span>
                  {sortBy === 'name' && (
                    <ChevronDown size={12} className={`transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer hover:text-gray-700 flex items-center space-x-1"
                  onClick={() => handleSort('department')}
                >
                  <span>Department</span>
                  {sortBy === 'department' && (
                    <ChevronDown size={12} className={`transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div 
                  className="col-span-2 cursor-pointer hover:text-gray-700 flex items-center space-x-1"
                  onClick={() => handleSort('role')}
                >
                  <span>Role</span>
                  {sortBy === 'role' && (
                    <ChevronDown size={12} className={`transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
                <div className="col-span-2">Wellness</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Users List */}
            <div className="divide-y divide-gray-200">
              {users.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* User Info */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 flex items-center space-x-2">
                              <span>{user.name}</span>
                              {user.role === 'manager' && <Crown size={14} className="text-red-500" />}
                              {user.role === 'admin' && <Shield size={14} className="text-purple-500" />}
                            </p>
                            <p className="text-sm text-gray-500">{user.employeeId}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {user.department}
                        </span>
                        {user.employment?.jobTitle && (
                          <p className="text-xs text-gray-500 mt-1">{user.employment.jobTitle}</p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <RoleIcon size={16} className={getRoleColor(user.role).split(' ')[0]} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Wellness */}
                      <div className="col-span-2">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(user.wellness?.riskLevel)}`}>
                            {user.wellness?.riskLevel || 'low'}
                          </span>
                          {user.stats?.daysSinceLastActivity !== null && (
                            <p className="text-xs text-gray-500">
                              {user.stats.daysSinceLastActivity === 0 
                                ? 'Active today' 
                                : `${user.stats.daysSinceLastActivity}d ago`
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        {user.isActive ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(user._id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user._id, !user.isActive)}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                            pagination.currentPage === page 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal
          title="Create New User"
          onClose={() => setShowCreateModal(false)}
          size="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john.doe@company.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="EMP001"
                />
                {formErrors.employeeId && <p className="text-red-500 text-xs mt-1">{formErrors.employeeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Min. 6 characters"
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.employment.jobTitle}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    employment: { ...formData.employment, jobTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.employment.startDate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    employment: { ...formData.employment, startDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus size={20} />
                )}
                <span>{actionLoading ? 'Creating...' : 'Create User'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          title="Edit User"
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          size="lg"
        >
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Cannot be changed)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.employeeId && <p className="text-red-500 text-xs mt-1">{formErrors.employeeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.employment.jobTitle}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    employment: { ...formData.employment, jobTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.employment.startDate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    employment: { ...formData.employment, startDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Edit size={20} />
                )}
                <span>{actionLoading ? 'Updating...' : 'Update User'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <Modal
          title="User Details"
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          size="lg"
        >
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <span>{selectedUser.name}</span>
                  {selectedUser.role === 'manager' && <Crown size={18} className="text-red-500" />}
                  {selectedUser.role === 'admin' && <Shield size={18} className="text-purple-500" />}
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                  {selectedUser.isActive ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle size={12} />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                      <XCircle size={12} />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{selectedUser.employeeId}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Employment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{selectedUser.department}</span>
                  </div>
                  {selectedUser.employment?.jobTitle && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase size={16} className="text-gray-400" />
                      <span className="text-gray-600">Job Title:</span>
                      <span className="font-medium">{selectedUser.employment.jobTitle}</span>
                    </div>
                  )}
                  {selectedUser.employment?.startDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">
                        {new Date(selectedUser.employment.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wellness Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Wellness Status</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Risk Level</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      getRiskLevelColor(selectedUser.wellness?.riskLevel)
                    }`}>
                      {selectedUser.wellness?.riskLevel || 'Low'}
                    </span>
                  </div>
                  {selectedUser.stats?.checkIns && (
                    <>
                      <div>
                        <p className="text-xs text-gray-600">Recent Check-ins</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedUser.stats.checkIns.totalCheckIns || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Avg Mood</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedUser.stats.checkIns.averageMood 
                            ? selectedUser.stats.checkIns.averageMood.toFixed(1) 
                            : '0.0'}/5
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openEditModal(selectedUser);
                }}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.config.title}
        message={confirmation.config.message}
        confirmText={confirmation.config.confirmText}
        cancelText={confirmation.config.cancelText}
        type={confirmation.config.type}
        isLoading={actionLoading}
      />

      {/* Prompt Modal */}
      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={promptModal.handleCancel}
        onConfirm={promptModal.handleConfirm}
        title={promptModal.config.title}
        message={promptModal.config.message}
        placeholder={promptModal.config.placeholder}
        inputType={promptModal.config.inputType}
        confirmText={promptModal.config.confirmText}
        cancelText={promptModal.config.cancelText}
        validation={promptModal.config.validation}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default ManagerUserManagement;