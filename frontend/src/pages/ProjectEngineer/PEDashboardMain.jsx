import { useState, useMemo, useEffect } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import { plansData, projectsData } from "../../data/mockData";

const PEDashboardMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProjects, setAllProjects] = useState(projectsData);

  // Load approved projects from localStorage
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
    setAllProjects([...projectsData, ...savedProjects]);
  }, []);

  // Refresh projects when coming back from edit (detect route change)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      setAllProjects([...projectsData, ...savedProjects]);
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
      // Find the project that contains the plan with the given planId
      const planId = location.state.planId;
      const plan = plansData.find(p => p.id === planId);
      if (plan) {
        const project = allProjects.find(proj => proj.id === plan.projectId);
        if (project) {
          setSelectedProject(project);
        }
      }
    }
  }, [location.state, allProjects]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProjects;
    return allProjects.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm, allProjects]);

  const filteredPlans = useMemo(() => {
    if (!selectedProject) return [];
    const term = searchTerm.trim();
    return plansData.filter(
      (plan) =>
        plan.projectId === selectedProject.id &&
        (!term || plan.id.includes(term))
    );
  }, [searchTerm, selectedProject]);

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedPlan(null);
    setSearchTerm("");
  };

  const handleEditProject = (project) => {
    navigate(`/pe-dashboard/edit-project/${project.id}`);
  };

  const handleDeleteProject = (projectId) => {
    // Remove project from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
    const updatedProjects = savedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('projectsData', JSON.stringify(updatedProjects));
    
    // Update local state
    setAllProjects(prev => prev.filter(p => p.id !== projectId));
    
    // If the deleted project was selected, clear selection
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setSelectedPlan(null);
    }
    
    alert('Project deleted successfully!');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-8">
          {!selectedProject ? (
            <>
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
              <ProjectList
                projects={filteredProjects}
                onSelect={setSelectedProject}
                selectedProject={selectedProject}
                showActions={true}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            </>
          ) : (
            <>
              {/* Back to Dashboard Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackToProjects}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>
              
              {/* Plans for selected project */}
              <PlanProgressList
                plans={filteredPlans}
                onPlanSelect={setSelectedPlan}
                selectedPlan={selectedPlan}
              />
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-1 space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={
              !selectedProject ? "Search projects..." : "Search plans..."
            }
          />

          {selectedProject && <ProjectDetails project={selectedProject} />}
        </div>
      </div>
    </div>
  );
};

export default PEDashboardMain;
