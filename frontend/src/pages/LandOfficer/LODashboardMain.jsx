import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, MapPin, Calendar, User, Plus, FileText, Building2, Bell, CheckCircle } from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const LODashboardMain = () => {
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssignedProjects();
    loadNotifications();
  }, []);

  const loadAssignedProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/assignments/assigned-projects');
      setAssignedProjects(response.data);
    } catch (error) {
      console.error('Error loading assigned projects:', error);
      setError('Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      // Load recent notifications
      const notificationsResponse = await api.get('/api/notifications/?limit=5');
      setNotifications(notificationsResponse.data || []);
      
      // Load unread count
      const unreadResponse = await api.get('/api/notifications/unread/count');
      setUnreadCount(unreadResponse.data?.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Don't show error for notifications, just log it
    }
  };

  const handleCreatePlan = (projectId, projectName) => {
    // Navigate to plan creation page
    navigate(`/lo-dashboard/create-plan/${projectId}`, {
      state: { projectName }
    });
  };

  const handleViewPlans = (projectId, projectName) => {
    // Navigate to plans view
    navigate(`/lo-dashboard/project/${projectId}/plans`, {
      state: { projectName }
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

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Notifications</h2>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.is_read 
                    ? 'border-l-gray-300 bg-gray-50' 
                    : 'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {notifications.length > 3 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      Status: <span className="capitalize">{project.status}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Assigned: {new Date(project.assigned_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>By: {project.assigned_by_first_name} {project.assigned_by_last_name}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Cost: ${project.initial_estimated_cost}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleCreatePlan(project.id, project.name)}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Create Plan</span>
                </button>
                
                <button
                  onClick={() => handleViewPlans(project.id, project.name)}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <FileText size={16} />
                  <span>View Plans</span>
                </button>
              </div>

              {/* Assignment Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Assignment Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
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
              <p className="text-2xl font-bold text-blue-800">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-700">Lots Created</p>
              <p className="text-2xl font-bold text-purple-800">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LODashboardMain;