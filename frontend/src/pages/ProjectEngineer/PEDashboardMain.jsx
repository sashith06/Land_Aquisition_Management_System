import { useState, useMemo, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import SearchBar from "../../components/SearchBar";
import ProjectList from "../../components/ProjectList";

const PEDashboardMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load only approved projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        // Load only approved projects (not pending ones)
        const response = await api.get('/api/projects/approved');
        setAllProjects(response.data);
      } catch (error) {
        console.error('Error loading approved projects:', error);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Refresh projects when coming back from edit (detect route change)
  useEffect(() => {
    const handleStorageChange = () => {
      // Reload only approved projects when needed
      const loadProjects = async () => {
        try {
          const response = await api.get('/api/projects/approved');
          setAllProjects(response.data);
        } catch (error) {
          console.error('Error refreshing projects:', error);
        }
      };
      
      loadProjects();
    };

    // Listen for storage changes and location changes
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Refresh on component mount/route change

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  // Handle navigation state when returning from lots page
  useEffect(() => {
    if (location.state?.returnToProject && location.state?.planId) {
      // This handles return navigation if needed
      console.log('Returned from plan/lots view');
    }
  }, [location.state, allProjects]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProjects;
    return allProjects.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm, allProjects]);

  const handleProjectSelect = (project) => {
    console.log('Project selected for viewing:', project);
    // Navigate to project plans view
    navigate(`/pe-dashboard/project/${project.id}/plans`, {
      state: { 
        projectName: project.name
      }
    });
  };

  const handleBackToProjects = () => {
    setSearchTerm("");
  };

  const handleEditProject = (project) => {
    navigate(`/pe-dashboard/edit-project/${project.id}`);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/api/projects/delete/${projectId}`);
      
      // Update local state by removing the deleted project
      setAllProjects(prev => prev.filter(p => p.id !== projectId));
      
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error.response?.data?.error || 'Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-3 space-y-8">
            {/* Section Title and Create Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Projects & Overview
              </h2>
              <button
                onClick={() => navigate("/pe-dashboard/create-project")}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                <span>Create Project</span>
              </button>
            </div>

            {/* Project Cards */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="mb-4">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No approved projects yet</h3>
                <p className="text-gray-500 mb-6">Projects will appear here after being approved by the Chief Engineer.</p>
                <button
                  onClick={() => navigate("/pe-dashboard/create-project")}
                  className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus size={20} />
                  <span>Create Your First Project</span>
                </button>
              </div>
            ) : (
              <ProjectList
                projects={filteredProjects}
                onSelect={handleProjectSelect}
                showActions={true}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            )}
          </div>

        {/* Right Column */}
        <div className="xl:col-span-1 space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search projects..."
          />
        </div>
      </div>
      )}
    </div>
  );
};

export default PEDashboardMain;
