import { useLocation, useParams, useNavigate } from 'react-router-dom';

// Breadcrumb utility to generate breadcrumbs based on current route and context
export const useBreadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const generateBreadcrumbs = (context = {}) => {
    const path = location.pathname;
    const { projectName, planName, lotName } = context;

    // Helper function to get dashboard path based on current route
    const getDashboardPath = () => {
      if (path.includes('/ce-dashboard')) return '/ce-dashboard';
      if (path.includes('/pe-dashboard')) return '/pe-dashboard';
      if (path.includes('/fo-dashboard')) return '/fo-dashboard';
      if (path.includes('/lo-dashboard')) return '/lo-dashboard';
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
      // Lots page
      return [
        ...baseBreadcrumbs,
        { label: 'Plans & Progress', to: '#', onClick: () => navigate(`${dashboardPath}/project/${params.projectId}/plans`) },
        { label: 'Lots' }
      ];
    }

    if (path.includes('/plan/') && path.includes('/lots/')) {
      // Lot Detail page
      return [
        ...baseBreadcrumbs,
        { label: 'Plans & Progress', to: '#', onClick: () => navigate(`${dashboardPath}/project/${params.projectId}/plans`) },
        { label: 'Lots', to: `${dashboardPath}/plan/${params.planId}/lots` },
        { label: `Lot ${params.lotId}` }
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

    if (path.includes('/project-requests')) {
      return [
        ...baseBreadcrumbs,
        { label: 'Project Requests' }
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
