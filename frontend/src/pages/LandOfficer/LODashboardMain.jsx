import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, MapPin, FileText } from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/Breadcrumb';
import ProjectList from '../../components/ProjectList';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const LODashboardMain = () => {
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [plansCreated, setPlansCreated] = useState(0);
  const [lotsCreated, setLotsCreated] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Decode token to get current user id
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }
    loadDashboardData();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      setLoading(true);
      console.log('Loading assigned projects...');
      const response = await api.get('/api/assignments/assigned-projects');
      console.log('Assigned projects response:', response.data);
      console.log('Number of assigned projects:', response.data.length);
      setAssignedProjects(response.data);
    } catch (error) {
      console.error('Error loading assigned projects:', error);
      setError('Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  // Load counts for plans created and lots created by current LO
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Assigned projects
      try {
        const assignedResp = await api.get('/api/assignments/assigned-projects');
        setAssignedProjects(Array.isArray(assignedResp.data) ? assignedResp.data : []);
      } catch (err) {
        console.error('Failed to load assigned projects:', err?.response?.data || err?.message || err);
        setAssignedProjects([]);
      }

      // My plans
      try {
        const myPlansResp = await api.get('/api/plans/my-plans');
        const myPlans = Array.isArray(myPlansResp.data) ? myPlansResp.data : [];
        setPlansCreated(myPlans.length);
      } catch (err) {
        console.error('Failed to load my plans:', err?.response?.data || err?.message || err);
        setPlansCreated(0);
      }

      // Lots for user
      try {
        const lotsResp = await api.get('/api/lots/user/lots');
        const lots = Array.isArray(lotsResp.data) ? lotsResp.data : [];
        let userId = currentUserId;
        if (!userId) {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.id;
            } catch (e) {
              // ignore
            }
          }
        }
        const myLotsCount = userId ? lots.filter(l => l.created_by === userId).length : lots.length;
        setLotsCreated(myLotsCount);
      } catch (err) {
        console.error('Failed to load lots for user:', err?.response?.data || err?.message || err);
        setLotsCreated(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Notifications section removed per request

  const handleViewDetails = (project) => {
    console.log('handleViewDetails called with project:', project);
    // Navigate to project details view
    navigate(`/dashboard/project-details/${project.id}`);
  };

  const handleCreatePlan = (project) => {
    // Navigate to plan creation page
    navigate(`/dashboard/create-plan/${project.id}`, {
      state: { projectName: project.name }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assigned projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadAssignedProjects}
          className="mt-2 text-red-600 hover:text-red-800 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Land Officer Dashboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Manage plans and lots for assigned projects
        </p>
      </div>

      {/* Notifications removed */}

      {/* Assigned Projects */}
      {assignedProjects.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Projects Assigned</h3>
          <p className="text-gray-500">
            You haven't been assigned to any projects yet. Contact your Project Engineer for project assignments.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Projects</h3>
          <ProjectList
            projects={assignedProjects}
            onSelect={(project) => {
              // Navigate to project plans view
              navigate(`/dashboard/project/${project.id}/plans`, {
                state: { projectName: project.name }
              });
            }}
            onViewDetails={handleViewDetails}
            onCreatePlan={handleCreatePlan}
            userRole="land_officer"
            assignedProjects={assignedProjects.map(p => ({ id: p.id }))}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-700">Assigned Projects</p>
              <p className="text-2xl font-bold text-green-800">{assignedProjects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-700">Plans Created</p>
              <p className="text-2xl font-bold text-blue-800">{plansCreated}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-700">Lots Created</p>
              <p className="text-2xl font-bold text-purple-800">{lotsCreated}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LODashboardMain;