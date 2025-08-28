import React, { useState, useEffect } from 'react';
import { FolderPlus, Clock, CheckCircle, XCircle, Eye, Filter, Search } from 'lucide-react';

// Mock project request data
const mockRequests = [
  {
    id: 'REQ-001',
    title: 'Highway Extension Project',
    requester: 'John Doe',
    department: 'Infrastructure',
    priority: 'High',
    status: 'Pending',
    submittedDate: '2024-01-15',
    estimatedCost: '$2.5M',
    description: 'Extend highway from Colombo to Kandy'
  },
  {
    id: 'REQ-002',
    title: 'Bridge Construction',
    requester: 'Jane Smith',
    department: 'Civil Engineering',
    priority: 'Medium',
    status: 'Under Review',
    submittedDate: '2024-01-20',
    estimatedCost: '$1.8M',
    description: 'New bridge over the river'
  },
  {
    id: 'REQ-003',
    title: 'Road Maintenance',
    requester: 'Mike Johnson',
    department: 'Maintenance',
    priority: 'Low',
    status: 'Approved',
    submittedDate: '2024-01-10',
    estimatedCost: '$500K',
    description: 'Routine road maintenance and repairs'
  },
  {
    id: 'REQ-004',
    title: 'Tunnel Project',
    requester: 'Sarah Wilson',
    department: 'Infrastructure',
    priority: 'High',
    status: 'Rejected',
    submittedDate: '2024-01-05',
    estimatedCost: '$5.2M',
    description: 'Underground tunnel construction'
  },
  {
    id: 'REQ-005',
    title: 'Smart Traffic System',
    requester: 'David Brown',
    department: 'Technology',
    priority: 'Medium',
    status: 'Pending',
    submittedDate: '2024-01-25',
    estimatedCost: '$800K',
    description: 'Implementation of smart traffic management system'
  },
];

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Load pending projects on component mount
  useEffect(() => {
    const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    const formattedRequests = pendingProjects.map(project => ({
      id: `REQ-${project.id}`,
      title: project.projectName,
      requester: project.submittedBy || 'Project Engineer',
      department: 'Land Acquisition',
      priority: 'High',
      status: project.status === 'pending_approval' ? 'Pending' : project.status,
      submittedDate: project.createdDate,
      estimatedCost: project.estimatedCost,
      description: `Land acquisition project: ${project.projectName}`,
      originalProject: project
    }));
    setRequests([...mockRequests, ...formattedRequests]);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || request.status === selectedStatus;
    const matchesPriority = selectedPriority === '' || request.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleApprove = (requestId) => {
    const request = requests.find(req => req.id === requestId);
    
    if (request && request.originalProject) {
      // Move project from pending to approved projects
      const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
      const approvedProjects = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
      
      // Remove from pending
      const updatedPending = pendingProjects.filter(p => p.id !== request.originalProject.id);
      localStorage.setItem('pendingProjects', JSON.stringify(updatedPending));
      
      // Add to approved and main projects data
      const approvedProject = {
        ...request.originalProject,
        status: 'approved',
        approvedBy: 'Chief Engineer',
        approvedAt: new Date().toISOString()
      };
      approvedProjects.push(approvedProject);
      localStorage.setItem('approvedProjects', JSON.stringify(approvedProjects));
      
      // Add to main projects data for display in PE dashboard
      const existingProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      const newProjectForDisplay = {
        id: `p${Date.now()}`,
        name: approvedProject.projectName,
        description: `Land acquisition project: ${approvedProject.projectName}`,
        createdDate: approvedProject.createdDate,
        progress: 0
      };
      existingProjects.push(newProjectForDisplay);
      localStorage.setItem('projectsData', JSON.stringify(existingProjects));
    }
    
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'Approved' } : req
    ));
    alert(`Request ${requestId} approved successfully! The project is now available in the Project Engineer dashboard.`);
  };

  const handleReject = (requestId) => {
    const confirmed = window.confirm('Are you sure you want to reject this request?');
    if (confirmed) {
      const request = requests.find(req => req.id === requestId);
      
      if (request && request.originalProject) {
        // Remove from pending projects
        const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
        const updatedPending = pendingProjects.filter(p => p.id !== request.originalProject.id);
        localStorage.setItem('pendingProjects', JSON.stringify(updatedPending));
      }
      
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: 'Rejected' } : req
      ));
    }
  };

  const handleViewDetails = (requestId) => {
    alert(`View details for request ${requestId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="text-yellow-500" size={16} />;
      case 'Under Review': return <Eye className="text-blue-500" size={16} />;
      case 'Approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'Rejected': return <XCircle className="text-red-500" size={16} />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
  const priorities = ['High', 'Medium', 'Low'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FolderPlus className="mr-2 sm:mr-3 text-green-600" size={28} />
            Project Requests
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Review and manage project requests from various departments</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.filter(req => req.status === 'Pending').length} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
            >
              <option value="">All Priority</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start">
            Total Requests: {filteredRequests.length}
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{request.title}</h3>
                  <p className="text-sm text-gray-500">ID: {request.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Requester:</span>
                    <p className="font-medium truncate">{request.requester}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <p className="font-medium truncate">{request.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estimated Cost:</span>
                    <p className="font-medium text-green-600">{request.estimatedCost}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium">{request.submittedDate}</p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{request.description}</p>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => handleViewDetails(request.id)}
                  className="w-full sm:flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                {request.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="w-full sm:flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="w-full sm:flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{requests.length}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Pending</h3>
          <p className="text-2xl lg:text-3xl font-bold text-yellow-600">
            {requests.filter(req => req.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">
            {requests.filter(req => req.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">High Priority</h3>
          <p className="text-2xl lg:text-3xl font-bold text-red-600">
            {requests.filter(req => req.priority === 'High').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectRequests;
