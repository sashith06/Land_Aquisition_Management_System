import { useState, useEffect } from 'react';
import { Eye, ArrowLeft, FileText, Calendar, DollarSign, MapPin, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import api from '../../api';

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data);
        setError('');
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompensationTypeLabel = (type) => {
    switch (type) {
      case 'regulation':
        return 'Regulation';
      case 'larc/super larc':
        return 'LARC / Super LARC';
      case 'special Committee Decision':
        return 'Special Committee Decision';
      default:
        return type || 'Not specified';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={generateBreadcrumbs()} />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={generateBreadcrumbs()} />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => navigate('/pe-dashboard')}
            className="mt-2 text-red-600 underline hover:text-red-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={generateBreadcrumbs()} />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p>Project not found</p>
          <button
            onClick={() => navigate('/pe-dashboard')}
            className="mt-2 text-yellow-600 underline hover:text-yellow-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={generateBreadcrumbs()} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/pe-dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/pe-dashboard/edit-project/${projectId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Edit Project</span>
          </button>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {project.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Project ID</div>
            <div className="font-mono text-lg font-semibold text-slate-900">#{project.id}</div>
          </div>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Project Name</span>
              <span className="text-sm font-semibold text-slate-900">{project.name}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Compensation Type</span>
              <span className="text-sm font-semibold text-slate-900">{getCompensationTypeLabel(project.compensation_type)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Created By</span>
              <span className="text-sm font-semibold text-slate-900">{project.creator_name || 'Project Engineer'}</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-600">Created Date</span>
              <span className="text-sm font-semibold text-slate-900">
                {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Land Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="text-green-600" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">Financial & Land Details</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Estimated Cost</span>
              <span className="text-sm font-semibold text-green-700">
                {project.initial_estimated_cost ? `Rs. ${parseFloat(project.initial_estimated_cost).toLocaleString()}` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Extent (Hectares)</span>
              <span className="text-sm font-semibold text-slate-900">
                {project.initial_extent_ha ? `${project.initial_extent_ha} ha` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Extent (Perches)</span>
              <span className="text-sm font-semibold text-slate-900">
                {project.initial_extent_perch ? `${project.initial_extent_perch} perches` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-slate-600">Land Area Conversion</span>
              <span className="text-xs text-slate-500">
                {project.initial_extent_ha && project.initial_extent_perch
                  ? `${project.initial_extent_ha} ha = ${project.initial_extent_perch} perches`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Documentation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="text-purple-600" size={20} />
          <h2 className="text-xl font-semibold text-slate-900">Legal Documentation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Section 2 Order Date</label>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.section_2_order ? new Date(project.section_2_order).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Section 2 Completion Date</label>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.section_2_com ? new Date(project.section_2_com).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Advance Tracing No</label>
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.advance_tracing_no || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Advance Tracing Date</label>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.advance_tracing_date ? new Date(project.advance_tracing_date).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Section 5 No</label>
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.section_5_no || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600">Section 5 Date</label>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-900">
                {project.section_5_no_date ? new Date(project.section_5_no_date).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {project.description && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-indigo-600" size={20} />
            <h2 className="text-xl font-semibold text-slate-900">Additional Notes</h2>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{project.description}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          onClick={() => navigate('/pe-dashboard')}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={() => navigate(`/pe-dashboard/edit-project/${projectId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FileText size={16} />
          <span>Edit Project</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
