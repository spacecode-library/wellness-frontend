import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  MoreVerticalIcon,
  UserCheckIcon,
  UserXIcon,
  MailIcon,
  KeyIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { useToast } from '../../components/shared/Toast';
import UserManagementModal from '../../components/admin/UserManagementModal';
import api from '../../services/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const roles = ['employee', 'manager', 'hr', 'admin'];

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, departmentFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        role: roleFilter,
        department: departmentFilter,
        status: statusFilter
      };

      const response = await api.getAllUsers(params);
      
      if (response.success && response.data.users) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
        toast.error('Failed to load users', 'Error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users', 'Error');
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

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData, existingUser) => {
    try {
      if (existingUser) {
        // Update existing user
        const response = await api.updateUser(existingUser._id, userData);
        if (response.success) {
          await loadUsers(); // Reload users to get updated data
          toast.success('User updated successfully', 'Success');
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const response = await api.createUser(userData);
        if (response.success) {
          await loadUsers(); // Reload users to include new user
          toast.success('User created successfully', 'Success');
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Operation failed', 'Error');
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        await loadUsers(); // Reload users to reflect deletion
        toast.success('User deleted successfully', 'Success');
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user', 'Error');
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      const response = await api.toggleUserStatus(userId, newStatus);
      if (response.success) {
        await loadUsers(); // Reload users to reflect status change
        toast.success(
          `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
          'Success'
        );
      } else {
        throw new Error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Failed to update user status', 'Error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first', 'Error');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      const response = await api.bulkUserAction(action, selectedUsers);
      if (response.success) {
        await loadUsers(); // Reload users to reflect bulk changes
        setSelectedUsers([]); // Clear selection
        toast.success(`Bulk ${action} completed successfully`, 'Success');
      } else {
        throw new Error(response.message || `Failed to ${action} users`);
      }
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error);
      toast.error(error.message || `Failed to ${action} users`, 'Error');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Employee ID', 'Role', 'Department', 'Status', 'Created At', 'Last Login'],
      ...users.map(user => [
        user.name,
        user.email,
        user.employeeId,
        user.role,
        user.department,
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
        title="User Management"
        subtitle="Manage user accounts, roles, and permissions"
        icon={UsersIcon}
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={exportUsers}
              className="btn-secondary"
            >
              <DownloadIcon size={16} />
              Export
            </button>
            <button
              onClick={handleCreateUser}
              className="btn-primary"
            >
              <PlusIcon size={16} />
              Add User
            </button>
          </div>
        }
      />


      {/* Filters */}
      <div className="card-glass">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-primary pl-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-primary"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input-primary"
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
            className="input-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg mb-4">
            <span className="text-sm text-gray-600">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="btn-secondary text-xs"
              >
                <UserCheckIcon size={14} />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="btn-secondary text-xs"
              >
                <UserXIcon size={14} />
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="btn-secondary text-xs text-red-600 hover:bg-red-50"
              >
                <TrashIcon size={14} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {user.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'hr'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'manager'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleUserStatus(user._id, !user.isActive)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-sage-600 hover:text-sage-900"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user._id === currentUser?.id}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <UsersIcon size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Inactive Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'admin' || u.role === 'hr').length}
            </div>
            <div className="text-sm text-gray-500">Admin/HR Users</div>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </motion.div>
  );
}

export default UserManagement;