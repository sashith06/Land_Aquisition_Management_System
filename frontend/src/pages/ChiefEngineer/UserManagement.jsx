// src/pages/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Edit, Trash2, Search, Filter, CheckCircle, 
  XCircle, Clock, UserCheck 
} from 'lucide-react';
import {
  getApprovedUsers,
  getPendingUsers,
  getRejectedUsers,
  approveUser,
  rejectUser,
  deleteUser,
  updateUser
} from '../../api.js';

// Helper to safely format a date value (string or Date). Returns fallback or '-' when absent.
const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  try {
    if (typeof value === 'string') {
      // If it's already an ISO-like string, split on 'T'
      if (value.includes('T')) return value.split('T')[0];
      // Otherwise try to parse
      const parsed = new Date(value);
      if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    }
    if (value instanceof Date) return value.toISOString().split('T')[0];
    // Fallback: attempt to construct Date
    const parsed = new Date(value);
    if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
  } catch (e) {
    // ignore
  }
  return fallback;
};

// Table header component
const UserTableHeader = ({ columns }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column) => (
        <th
          key={column.key}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
);

// Approved user row
const UserTableRow = ({ user, onEdit, onDelete, getRoleColor }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <img className="h-10 w-10 rounded-full mr-3" src={user.avatar} alt={user.name} />
        <div>
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
        {user.role}
      </span>
    </td>
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.approved_at, user.joinDate || '-')}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex space-x-2">
        <button
          onClick={() => onDelete(user.id)}
          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
          title="Delete User"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

// Pending request row
const PendingRequestRow = ({ request, onApprove, onReject, getRoleColor }) => (
  <tr className="hover:bg-yellow-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <img className="h-10 w-10 rounded-full mr-3" src={request.avatar} alt={request.name} />
        <div>
          <div className="text-sm font-medium text-gray-900">{request.name}</div>
          <div className="text-sm text-gray-500">{request.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(request.role)}`}>
        {request.role}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestDate}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex space-x-2">
        <button
          onClick={() => onApprove(request.id)}
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center space-x-1"
        >
          <CheckCircle size={14} />
          <span>Approve</span>
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center space-x-1"
        >
          <XCircle size={14} />
          <span>Reject</span>
        </button>
      </div>
    </td>
  </tr>
);

// Rejected user row
const RejectedUserRow = ({ user, getRoleColor }) => (
  <tr className="hover:bg-red-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <img className="h-10 w-10 rounded-full mr-3" src={user.avatar} alt={user.name} />
        <div>
          <div className="text-sm font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
        {user.role}
      </span>
    </td>
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.requestDate}</td>
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.rejected_at, user.rejectionDate || '-')}</td>
  </tr>
);

// Search + filter component
const SearchAndFilter = ({ searchTerm, onSearchChange, selectedRole, onRoleChange, roles, resultCount, activeTab }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="text-sm text-gray-500">
      {resultCount} {activeTab === 'approved'
        ? 'approved users'
        : activeTab === 'pending'
        ? 'pending requests'
        : 'rejected users'}
    </div>
  </div>
);

// Main Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredRejectedUsers, setFilteredRejectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState('approved');


  // Fetch from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const approved = await getApprovedUsers();
        const pending = await getPendingUsers();
        const rejected = await getRejectedUsers();

        // Filter out Chief Engineers from all lists since Chief Engineer is the admin
        const filterOutChiefEngineer = (users) => 
          users.filter(user => user.role !== 'chief_engineer');

        setUsers(filterOutChiefEngineer(approved.data));
        setPendingRequests(filterOutChiefEngineer(pending.data));
        setRejectedUsers(filterOutChiefEngineer(rejected.data));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  const filterData = useCallback(() => {
    const matches = (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    setFilteredUsers(users.filter(u => matches(u) && (!selectedRole || u.role === selectedRole)));
    setFilteredRequests(pendingRequests.filter(r => matches(r) && (!selectedRole || r.role === selectedRole)));
    setFilteredRejectedUsers(rejectedUsers.filter(r => matches(r) && (!selectedRole || r.role === selectedRole)));
  }, [users, pendingRequests, rejectedUsers, searchTerm, selectedRole]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  // Utility function for role badge colors
  const getRoleColor = (role) => {
    const roleColors = {
      'land_officer': 'bg-blue-100 text-blue-800',
      'project_engineer': 'bg-green-100 text-green-800',
      'financial_officer': 'bg-yellow-100 text-yellow-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };


  // Approve / Reject / Delete
  const handleApproveUser = async (requestId) => {
    try {
      await approveUser(requestId);
      const approvedUser = pendingRequests.find(r => r.id === requestId);
      setUsers([...users, { ...approvedUser, joinDate: new Date().toISOString().split("T")[0] }]);
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      alert("User approved ✅");
    } catch (err) {
      alert("Failed to approve user");
    }

 
  };

  const handleRejectUser = async (requestId) => {
    try {
      await rejectUser(requestId);
      const rejectedUser = pendingRequests.find(r => r.id === requestId);
      setRejectedUsers([...rejectedUsers, { ...rejectedUser, rejectionDate: new Date().toISOString().split("T")[0] }]);
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      alert("User rejected ❌");
    } catch (err) {
      alert("Failed to reject user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted 🗑️");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // Table configs
  const userTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'actions', label: 'Actions' }
  ];
  const requestTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Requested Role' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'actions', label: 'Actions' }
  ];
  const rejectedTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Requested Role' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'rejectionDate', label: 'Rejection Date' }
  ];

  // All roles for filter dropdown (excluding Chief Engineer since it's admin-only)
  const allRoles = [...new Set([
    ...users.map(u => u.role),
    ...pendingRequests.map(r => r.role),
    ...rejectedUsers.map(r => r.role)
  ])].filter(role => role !== 'chief_engineer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users size={28} />
            <span>User Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage user accounts, approvals, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} Pending Approvals
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {rejectedUsers.length} Rejected Users
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('approved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserCheck size={18} />
              <span>Approved Users ({users.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock size={18} />
              <span>Pending Requests ({pendingRequests.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <XCircle size={18} />
              <span>Rejected Users ({rejectedUsers.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Search + Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        roles={allRoles}
        resultCount={
          activeTab === 'approved'
            ? filteredUsers.length
            : activeTab === 'pending'
            ? filteredRequests.length
            : filteredRejectedUsers.length
        }
        activeTab={activeTab}
      />

      {/* Table per tab */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <UserTableHeader columns={userTableColumns} />
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onEdit={(id) => alert(`Edit user ${id}`)}
                    onDelete={handleDeleteUser}
                    getRoleColor={getRoleColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <UserTableHeader columns={requestTableColumns} />
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <PendingRequestRow
                    key={request.id}
                    request={request}
                    onApprove={handleApproveUser}
                    onReject={handleRejectUser}
                    getRoleColor={getRoleColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rejected' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <UserTableHeader columns={rejectedTableColumns} />
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRejectedUsers.map((user) => (
                  <RejectedUserRow
                    key={user.id}
                    user={user}
                    getRoleColor={getRoleColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
