import React, { useState, useEffect } from 'react';
import { FolderPlus, Clock, CheckCircle, XCircle, Eye, Filter, Search } from 'lucide-react';
import { pendingProjectsData } from '../../data/mockData';

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load pending projects from localStorage and mockData
  useEffect(() => {
    const savedPendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    const allPendingProjects = [...pendingProjectsData, ...savedPendingProjects];
    
    // Convert to request format
    const projectRequests = allPendingProjects.map(project => ({
      id: project.id,
      title: project.projectName,
      requester: `PE${project.createdBy?.slice(-3) || '001'}`,
      department: 'Project Engineering',
      priority: project.estimatedCost && parseFloat(project.estimatedCost.replace(/[^0-9.]/g, '')) > 100 ? 'High' : 'Medium',
      status: project.status === 'pending' ? 'Pending' : project.status,
      submittedDate: project.createdDate,
      estimatedCost: project.estimatedCost,
      description: `Land acquisition project: ${project.projectName}`,
      projectData: project // Store full project data for approval
    }));

    setRequests(projectRequests);
    setFilteredRequests(projectRequests);
  }, []);

  // Filter requests based on status and search term
  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requester.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchTerm]);

  const handleApprove = (requestId) => {
    const request = requests.find(req => req.id === requestId);
    if (request && request.projectData) {
      // Move from pending to approved projects
      const approvedProject = {
        ...request.projectData,
        id: `p${Date.now()}`, // Change ID prefix from 'pp' to 'p'
        name: request.projectData.projectName,
        description: `Land acquisition project: ${request.projectData.projectName}`,
        status: 'approved',
        approvedBy: 'CE001',
        approvedDate: new Date().toISOString().split('T')[0].replace(/-/g, '.')
      };

      // Add to approved projects
      const existingProjects = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
      existingProjects.push(approvedProject);
      localStorage.setItem('approvedProjects', JSON.stringify(existingProjects));

      // Remove from pending projects
      const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
      const updatedPending = pendingProjects.filter(p => p.id !== request.projectData.id);
      localStorage.setItem('pendingProjects', JSON.stringify(updatedPending));

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'Approved' } : req
      ));

      alert(`Project "${request.title}" has been approved and will now appear in Projects & Overview.`);
      setSelectedRequest(null);
    }
  };

  const handleReject = (requestId) => {
    const request = requests.find(req => req.id === requestId);
    if (request && confirm(`Are you sure you want to reject "${request.title}"?`)) {
      // Remove from pending projects
      const pendingProjects = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
      const updatedPending = pendingProjects.filter(p => p.id !== request.projectData?.id);
      localStorage.setItem('pendingProjects', JSON.stringify(updatedPending));

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'Rejected' } : req
      ));

      alert(`Project "${request.title}" has been rejected.`);
      setSelectedRequest(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="text-yellow-500" size={16} />;
      case 'Approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'Rejected': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  if (selectedRequest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Project Request Details</h1>
          <button
            onClick={() => setSelectedRequest(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Requests
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-3">
                <div><strong>Project Name:</strong> {selectedRequest.projectData?.projectName}</div>
                <div><strong>Estimated Cost:</strong> {selectedRequest.projectData?.estimatedCost}</div>
                <div><strong>Extent (Ha):</strong> {selectedRequest.projectData?.extentHa}</div>
                <div><strong>Extent (Perch):</strong> {selectedRequest.projectData?.extentPerch}</div>
                <div><strong>Acquisition Type:</strong> {selectedRequest.projectData?.acquisitionType}</div>
                <div><strong>Created By:</strong> {selectedRequest.requester}</div>
                <div><strong>Submitted Date:</strong> {selectedRequest.submittedDate}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="space-y-3">
                {selectedRequest.projectData?.section02OrderDay && (
                  <div><strong>Section 02 Order:</strong> {selectedRequest.projectData.section02OrderDay}/{selectedRequest.projectData.section02OrderMonth}/{selectedRequest.projectData.section02OrderYear}</div>
                )}
                {selectedRequest.projectData?.advanceTracingNo && (
                  <div><strong>Advance Tracing No:</strong> {selectedRequest.projectData.advanceTracingNo}</div>
                )}
                {selectedRequest.projectData?.section05GazetteNo && (
                  <div><strong>Section 05 Gazette No:</strong> {selectedRequest.projectData.section05GazetteNo}</div>
                )}
                {selectedRequest.projectData?.note && (
                  <div><strong>Note:</strong> {selectedRequest.projectData.note}</div>
                )}
              </div>
            </div>
          </div>

          {selectedRequest.status === 'Pending' && (
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="inline mr-2" size={16} />
                Approve Project
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="inline mr-2" size={16} />
                Reject Project
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve project submissions from Project Engineers</p>
        </div>
        <div className="flex items-center gap-2">
          <FolderPlus className="text-blue-500" size={24} />
          <span className="text-sm text-gray-500">Pending: {requests.filter(r => r.status === 'Pending').length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center">
            Total Requests: {filteredRequests.length}
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-500">ID: {request.id}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Requester:</span>
                    <p className="font-medium">{request.requester}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <p className="font-medium">{request.department}</p>
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
                  <p className="text-sm text-gray-700 mt-1">{request.description}</p>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleViewDetails(request)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Eye className="inline mr-1" size={14} />
                  View Details
                </button>
                {request.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="inline mr-1" size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <XCircle className="inline mr-1" size={14} />
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
          <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {requests.filter(req => req.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-green-600">
            {requests.filter(req => req.status === 'Approved').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-red-600">
            {requests.filter(req => req.priority === 'High').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectRequests;
