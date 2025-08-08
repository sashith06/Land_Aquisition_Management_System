import React, { useState } from 'react';
import { Search, Check, X, Edit2, Trash2, FileText, Calendar } from 'lucide-react';

const ProjectRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingProjects, setPendingProjects] = useState([
    {
      id: 1,
      title: 'Highway Extension Project',
      submitted: '2025-01-22',
      description: 'Extension of highway from Colombo to Kandy'
    },
    {
      id: 2,
      title: 'Bridge Construction',
      submitted: '2025-01-20',
      description: 'Construction of new bridge over Mahaweli River'
    },
    {
      id: 3,
      title: 'Rural Road Development',
      submitted: '2025-01-18',
      description: 'Development of rural roads in Anuradhapura district'
    }
  ]);

  const [processedProjects, setProcessedProjects] = useState([
    {
      id: 4,
      title: 'Urban Development Phase 2',
      approved: '2025-01-15',
      status: 'approved',
      description: 'Urban development project for Colombo suburbs'
    },
    {
      id: 5,
      title: 'Coastal Road Maintenance',
      approved: '2025-01-12',
      status: 'approved',
      description: 'Maintenance of coastal roads in Southern Province'
    }
  ]);

  const handleApprove = (projectId) => {
    const project = pendingProjects.find(p => p.id === projectId);
    if (project) {
      const approvedProject = {
        ...project,
        approved: new Date().toISOString().split('T')[0],
        status: 'approved'
      };
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      setProcessedProjects(prev => [...prev, approvedProject]);
    }
  };

  const handleReject = (projectId) => {
    const project = pendingProjects.find(p => p.id === projectId);
    if (project) {
      const rejectedProject = {
        ...project,
        rejected: new Date().toISOString().split('T')[0],
        status: 'rejected'
      };
      setPendingProjects(prev => prev.filter(p => p.id !== projectId));
      setProcessedProjects(prev => [...prev, rejectedProject]);
    }
  };

  const handleEdit = (projectId) => {
    console.log('Edit project:', projectId);
  };

  const handleDelete = (projectId) => {
    setProcessedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const getStatusBadgeClass = (status) => {
    const base = "px-3 py-1 rounded-full text-sm font-medium";
    if (status === 'approved') return `${base} bg-green-100 text-green-800`;
    if (status === 'rejected') return `${base} bg-red-100 text-red-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  const filteredPendingProjects = pendingProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProcessedProjects = processedProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProjects = processedProjects.length + pendingProjects.length;
  const totalApproved = processedProjects.filter(p => p.status === 'approved').length;
  const totalRejected = processedProjects.filter(p => p.status === 'rejected').length;
  const totalPending = pendingProjects.length;

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Approved Projects',
      value: totalApproved,
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Approvals',
      value: totalPending,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Rejected Projects',
      value: totalRejected,
      icon: X,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Project Requests</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          />
        </div>

        {/* Pending Projects */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Project Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Project Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPendingProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{project.submitted}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(project.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(project.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center space-x-1"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                          <span className="text-xs">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPendingProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">No pending projects found</div>
            )}
          </div>
        </div>

        {/* Processed Projects */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Processed Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Project Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProcessedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">{project.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadgeClass(project.status)}>
                        {project.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {project.approved || project.rejected || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProcessedProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">No processed projects found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRequests;
