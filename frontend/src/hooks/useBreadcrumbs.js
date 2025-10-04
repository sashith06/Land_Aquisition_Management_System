import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { plansData, projectsData } from '../data/mockData';

// Breadcrumb utility to generate breadcrumbs based on current route and context
export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const generateBreadcrumbs = (context = {}) => {
    const path = location.pathname;
    const { projectName, planName, lotName, projectId, planId } = context;

    // Helper function to get dashboard path based on current route
    const getDashboardPath = () => {
      if (path.includes('/ce-dashboard')) return '/ce-dashboard';
      if (path.includes('/pe-dashboard')) return '/pe-dashboard';
      if (path.includes('/fo-dashboard')) return '/fo-dashboard';
      if (path.includes('/lo-dashboard')) return '/dashboard';
      return '/dashboard';
    };

    const dashboardPath = getDashboardPath();

    // Base breadcrumbs for all dashboards
    const baseBreadcrumbs = [
      { label: 'Dashboard', to: dashboardPath }
    ];

    // Route-specific breadcrumbs
    if (path.includes('/project/') && path.includes('/plans')) {
      // Project Plans page
      return [
        ...baseBreadcrumbs,
        { label: projectName || 'Project', to: `${dashboardPath}/project/${params.projectId}/plans` },
        { label: 'Plans' }
      ];
    }

    if (path.includes('/plan/') && path.includes('/lots') && !path.includes('/lots/')) {
      // Lots page - use project info from context if available
      if (projectId && projectName) {
        return [
          ...baseBreadcrumbs,
          { 
            label: 'Plans & Progress', 
            to: `${dashboardPath}/project/${projectId}/plans`
          },
          { label: 'Lots' }
        ];
      } else {
        // Fallback if project info not available
        return [
          ...baseBreadcrumbs,
          { label: 'Plans & Progress', to: '#', onClick: () => navigate(`${dashboardPath}`) },
          { label: 'Lots' }
        ];
      }
    }

    if (path.includes('/plan/') && path.includes('/lots/')) {
      // Lot Detail page - use project info from context if available
      if (projectId && projectName) {
        return [
          ...baseBreadcrumbs,
          { 
            label: 'Plans & Progress', 
            to: `${dashboardPath}/project/${projectId}/plans`
          },
          { label: 'Lots', to: `${dashboardPath}/plan/${params.planId}/lots` },
          { label: `Lot ${params.lotId}` }
        ];
      } else {
        // Fallback if project info not available
        return [
          ...baseBreadcrumbs,
          { label: 'Plans & Progress', to: '#', onClick: () => navigate(`${dashboardPath}`) },
          { label: 'Lots', to: `${dashboardPath}/plan/${params.planId}/lots` },
          { label: `Lot ${params.lotId}` }
        ];
      }
    }

    if (path.match(/\/plan\/[^\/]+$/)) {
      // Plan Detail page - direct plan access
      const plan = plansData.find(p => p.id === params.id);
      
      if (plan) {
        const project = projectsData.find(p => p.id === plan.projectId);
        
        return [
          ...baseBreadcrumbs,
          { 
            label: project ? project.name : 'Project', 
            to: project ? `${dashboardPath}/project/${project.id}/plans` : dashboardPath 
          },
          { label: `Plan ${plan.id}` }
        ];
      }
      
      return [
        ...baseBreadcrumbs,
        { label: 'Plans & Progress', to: dashboardPath },
        { label: 'Plan Details' }
      ];
    }

    if (path.includes('/create-project')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Create Project' }
      ];
    }

    if (path.includes('/edit-project/')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Edit Project' }
      ];
    }

    if (path.includes('/create-plan')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Create Plan' }
      ];
    }

    if (path.includes('/edit-plan/')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Edit Plan' }
      ];
    }

    if (path.includes('/financial-details/')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Financial Details' }
      ];
    }

    if (path.includes('/analysis')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Analysis' }
      ];
    }

    if (path.includes('/messages')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Messages' }
      ];
    }

    if (path.includes('/reports')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Reports' }
      ];
    }

    if (path.includes('/profile')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Profile' }
      ];
    }

    if (path.includes('/user-management')) {
      return [
        ...baseBreadcrumbs,
        { label: 'User Management' }
      ];
    }

    if (path.includes('/project-details/')) {
      // For Chief Engineer, show "Project Requests" breadcrumb
      // For Project Engineer, show "Dashboard" breadcrumb
      const breadcrumbLabel = path.includes('/ce-dashboard') ? 'Project Requests' : 'Dashboard';
      const breadcrumbPath = path.includes('/ce-dashboard') ? `${dashboardPath}/project-requests` : dashboardPath;

      return [
        ...baseBreadcrumbs,
        { label: breadcrumbLabel, to: breadcrumbPath },
        { label: 'Project Details' }
      ];
    }

    if (path.includes('/project-assignment')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Project Assignment' }
      ];
    }

    if (path.includes('/assigned-projects')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Assigned Projects' }
      ];
    }

    // Default: just show Dashboard
    return baseBreadcrumbs;
  };

  return { generateBreadcrumbs };
};
