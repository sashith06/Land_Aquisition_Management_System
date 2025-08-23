import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Search, Filter, CheckCircle, XCircle, Clock, UserCheck, Mail, Phone } from 'lucide-react';

// Mock user data with more comprehensive structure
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 123 4567',
    role: 'Land Officer',
    department: 'Land Acquisition',
    joinDate: '2023-01-15',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+94 77 987 6543',
    role: 'Project Manager',
    department: 'Project Management',
    joinDate: '2022-03-20',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+94 77 555 1234',
    role: 'Project Manager',
    department: 'Project Management',
    joinDate: '2023-06-10',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+94 77 111 2222',
    role: 'Financial Officer',
    department: 'Finance',
    joinDate: '2023-02-28',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
];

// Mock pending requests data
const mockPendingRequests = [
  {
    id: 101,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'Land Officer',
    department: 'Land Acquisition',
    requestDate: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 102,
    name: 'Lisa Chang',
    email: 'lisa.chang@example.com',
    role: 'Financial Officer',
    department: 'Finance',
    requestDate: '2024-01-18',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

// Mock rejected users data
const mockRejectedUsers = [
  {
    id: 201,
    name: 'Tom Wilson',
    email: 'tom.wilson@example.com',
    role: 'Project Manager',
    department: 'Project Management',
    requestDate: '2024-01-10',
    rejectionDate: '2024-01-12',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

// Subcomponents for better organization
const UserTableHeader = ({ columns }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column) => (
        <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
);

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
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.department}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.joinDate}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(user.id)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
          title="Edit User"
        >
          <Edit size={16} />
        </button>
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
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {request.department}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {request.requestDate}
    </td>
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
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.department}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.requestDate}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.rejectionDate}
    </td>
  </tr>
);

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
        : 'rejected users'
      }
    </div>
  </div>
);

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState(mockUsers);
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
  const [rejectedUsers, setRejectedUsers] = useState(mockRejectedUsers);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredRejectedUsers, setFilteredRejectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState('approved');

  // Get all unique roles
  const allRoles = [...new Set([
    ...users.map(u => u.role),
    ...pendingRequests.map(r => r.role),
    ...rejectedUsers.map(r => r.role)
  ])];

  // Update filtered data when search/filter changes
  useEffect(() => {
    filterData();
  }, [users, pendingRequests, rejectedUsers, searchTerm, selectedRole]);

  const filterData = () => {
    // Filter users
    const filteredUsersData = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === '' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    // Filter pending requests
    const filteredRequestsData = pendingRequests.filter(request => {
      const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === '' || request.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    // Filter rejected users
    const filteredRejectedData = rejectedUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === '' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });

    setFilteredUsers(filteredUsersData);
    setFilteredRequests(filteredRequestsData);
    setFilteredRejectedUsers(filteredRejectedData);
  };

  // Utility function for role colors
  const getRoleColor = (role) => {
    const roleColors = {
      'Land Officer': 'bg-blue-100 text-blue-800',
      'Project Manager': 'bg-green-100 text-green-800',
      'Financial Officer': 'bg-yellow-100 text-yellow-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  // Event handlers
  const handleApproveUser = (requestId) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) return;

    // Move request to users list with Active status
    const newUser = {
      ...request,
      id: Date.now(), // Generate new ID for the user
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      phone: '+94 77 XXX XXXX' // Default phone
    };

    setUsers([...users, newUser]);
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    setActiveTab('approved');
    alert(`User ${request.name} has been approved and activated. You can now see them in the Approved Users tab.`);
  };

  const handleRejectUser = (requestId) => {
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) return;

    const confirmed = window.confirm(`Are you sure you want to reject the registration request for ${request.name}?`);
    if (!confirmed) return;

    // Move request to rejected users list
    const rejectedUser = {
      ...request,
      rejectionDate: new Date().toISOString().split('T')[0]
    };

    setRejectedUsers([...rejectedUsers, rejectedUser]);
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    alert(`Registration request for ${request.name} has been rejected and moved to rejected users.`);
  };

  const handleEditUser = (userId) => {
    alert(`Edit user with ID: ${userId}`);
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmed = window.confirm(`Are you sure you want to delete user ${user.name}?`);
    if (!confirmed) return;

    setUsers(users.filter(u => u.id !== userId));
    alert(`User ${user.name} has been deleted.`);
  };

  // Table configurations
  const userTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'actions', label: 'Actions' }
  ];

  const requestTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Requested Role' },
    { key: 'department', label: 'Department' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'actions', label: 'Actions' }
  ];

  const rejectedTableColumns = [
    { key: 'user', label: 'User' },
    { key: 'role', label: 'Requested Role' },
    { key: 'department', label: 'Department' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'rejectionDate', label: 'Rejection Date' }
  ];

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

      {/* Tab Navigation */}
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

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        roles={allRoles}
        resultCount={
          activeTab === 'approved' ? filteredUsers.length : 
          activeTab === 'pending' ? filteredRequests.length : 
          filteredRejectedUsers.length
        }
        activeTab={activeTab}
      />

      {/* Content based on active tab */}
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
                    onEdit={handleEditUser}
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

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Pending Requests</h3>
          <p className="text-2xl lg:text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Rejected Users</h3>
          <p className="text-2xl lg:text-3xl font-bold text-red-600">{rejectedUsers.length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
