import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import ProjectList from '../../components/ProjectList';
import SearchBar from '../../components/SearchBar';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

// Header component for the dashboard
const FODashboardHeader = () => (
  <div className="mb-6 sm:mb-8">
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
      Financial Officer Dashboard
    </h1>
    <p className="text-sm sm:text-base text-slate-600">
      Management and valuation of land acquisition projects
    </p>
  </div>
);

// Main content grid component - Shows projects overview
const MainContent = ({ filteredProjects, onProjectSelect, onViewDetails }) => (
  <div className="space-y-6 sm:space-y-8">
    {/* Project List */}
    <ProjectList
      projects={filteredProjects}
      onSelect={onProjectSelect}
      onViewDetails={onViewDetails}
      userRole="financial_officer"
    />
  </div>
);

// Sidebar component
const FODashboardSidebar = ({ searchTerm, onSearchChange }) => (
  <div className="space-y-6">
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Search projects..."
    />
  </div>
);

const FODashboardMain = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load approved projects from API
  useEffect(() => {
    const loadApprovedProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/projects/approved');
        setAllProjects(response.data);
      } catch (error) {
        console.error('Error loading approved projects:', error);
        // Fallback to empty array on error
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedProjects();
  }, []);

  // Handle navigation state when returning from lots page
  useEffect(() => {
    if (location.state?.returnToProject && location.state?.planId) {
      // This handles return navigation if needed
      console.log('Returned from plan/lots view');
    }
  }, [location.state, allProjects]);

  // Memoized filtered projects for better performance
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return allProjects;

    const term = searchTerm.toLowerCase();
    return allProjects.filter(project =>
      project.id.toLowerCase().includes(term) ||
      project.name.toLowerCase().includes(term) ||
      (project.description && project.description.toLowerCase().includes(term))
    );
  }, [searchTerm, allProjects]);

  const handleProjectSelect = (project) => {
    console.log('Project selected for viewing:', project);
    // Navigate to project plans view
    navigate(`/fo-dashboard/project/${project.id}/plans`, {
      state: {
        projectName: project.name
      }
    });
  };

  const handleViewDetails = (project) => {
    // Navigate to project details view
    navigate(`/fo-dashboard/project-details/${project.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      <FODashboardHeader />

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      ) : (
        /* Dashboard Content Grid */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <MainContent
              filteredProjects={filteredProjects}
              onProjectSelect={handleProjectSelect}
              onViewDetails={handleViewDetails}
            />
          </div>
          {/* Right Sidebar */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <FODashboardSidebar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FODashboardMain;
