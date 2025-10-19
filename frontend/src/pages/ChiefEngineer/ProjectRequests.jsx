import React, { useState, useEffect } from 'react';
import { FolderPlus, Clock, CheckCircle, XCircle, Eye, Filter, Search, AlertCircle, FileText, Calendar, DollarSign, MapPin, User, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const ProjectRequests = () => {
  const { generateBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load pending projects on component mount
  useEffect(() => {
    loadPendingProjects();
  }, []);

  const loadPendingProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/projects/all');
      setRequests(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (projectId) => {
    try {
      await api.put(`/api/projects/approve/${projectId}`);
      await loadPendingProjects(); // Reload the list
      alert('Project approved successfully!');
    } catch (err) {
      console.error('Error approving project:', err);
      alert('Failed to approve project. Please try again.');
    }
  };

  const handleReject = async (projectId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      await api.put(`/api/projects/reject/${projectId}`, {
        rejection_reason: rejectionReason.trim()
      });
      await loadPendingProjects(); // Reload the list
      alert('Project rejected successfully!');
    } catch (err) {
      console.error('Error rejecting project:', err);
      alert('Failed to reject project. Please try again.');
    }
  };

  const handleViewDetails = (request) => {
    navigate(`/ce-dashboard/project-details/${request.id}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={16} />;
      case 'approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FolderPlus className="mr-2 sm:mr-3 text-green-600" size={28} />
            Project Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Review and manage all project requests and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.filter(req => req.status === 'pending').length} Pending
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.filter(req => req.status === 'approved').length} Approved
          </span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {requests.filter(req => req.status === 'rejected').length} Rejected
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertCircle className="flex-shrink-0 mr-2 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start">
            Total Requests: {filteredRequests.length}
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FolderPlus className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedStatus ? 'Try adjusting your filters.' : 'Projects will appear here when they are created.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{request.name}</h3>
                    <p className="text-sm text-gray-500">ID: {request.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Created by:</span>
                      <p className="font-medium truncate">{request.creator_name || 'Project Engineer'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <p className="font-medium truncate">Land Acquisition</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estimated Cost:</span>
                      <p className="font-medium text-green-600">{formatCurrency(request.initial_estimated_cost)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-500">Extent:</span>
                      <p className="font-medium">
                        {request.initial_extent_ha || 0} ha, {request.initial_extent_perch || 0} perch
                      </p>
                    </div>
                  </div>

                  {request.notes && (
                    <div>
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{request.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="w-full sm:flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  {request.status === 'pending' && (
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
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{requests.length}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Pending</h3>
          <p className="text-2xl lg:text-3xl font-bold text-yellow-600">
            {requests.filter(req => req.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">
            {requests.filter(req => req.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-2">Rejected</h3>
          <p className="text-2xl lg:text-3xl font-bold text-red-600">
            {requests.filter(req => req.status === 'rejected').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectRequests;
