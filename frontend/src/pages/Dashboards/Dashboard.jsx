import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import ProjectOptionButtons from "../../components/ProjectOptionButtons";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import CreateProject from "../ProjectEngineer/CreateProject";
import { plansData, projectsData } from "../../data/mockData";

const Dashboard = ({ showCreateProject = false, showProjectOptions = true }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProjects, setAllProjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load approved projects from localStorage and combine with static data
  useEffect(() => {
    const approvedProjects = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
    
    // Filter out any projects with "Galle - Matara Highway Extension" in the name
    const filteredApprovedProjects = approvedProjects.filter(
      project => !project.projectName?.includes('Galle - Matara Highway Extension') &&
                 !project.name?.includes('Galle - Matara Highway Extension')
    );
    
    // Update localStorage if we filtered out any projects
    if (filteredApprovedProjects.length !== approvedProjects.length) {
      localStorage.setItem('approvedProjects', JSON.stringify(filteredApprovedProjects));
    }
    
    const combinedProjects = [...projectsData, ...filteredApprovedProjects];
    setAllProjects(combinedProjects);
  }, []);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProjects;
    return allProjects.filter((p) => (p.name || p.projectName).toLowerCase().includes(term));
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
    
    // Refresh projects list to show any newly approved projects
    const approvedProjects = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
    
    // Filter out any projects with "Galle - Matara Highway Extension" in the name
    const filteredApprovedProjects = approvedProjects.filter(
      project => !project.projectName?.includes('Galle - Matara Highway Extension') &&
                 !project.name?.includes('Galle - Matara Highway Extension')
    );
    
    // Update localStorage if we filtered out any projects
    if (filteredApprovedProjects.length !== approvedProjects.length) {
      localStorage.setItem('approvedProjects', JSON.stringify(filteredApprovedProjects));
    }
    
    const combinedProjects = [...projectsData, ...filteredApprovedProjects];
    setAllProjects(combinedProjects);
  };

  const handleProjectAction = (action) => {
    switch (action) {
      case "edit":
        if (selectedProject) alert(`Edit project: ${selectedProject.name}`);
        break;
      case "delete":
        if (
          selectedProject &&
          window.confirm(`Delete project: ${selectedProject.name}?`)
        ) {
          alert("Delete project functionality will be implemented");
          handleBackToProjects();
        }
        break;
      default:
        break;
    }
  };

  const handleCreateProject = () => {
    setShowCreateForm(true);
    setSelectedProject(null);
    setSelectedPlan(null);
    setSearchTerm("");
  };

  const handleProjectCreated = () => {
    setShowCreateForm(false);
    alert('Project submitted successfully! It will appear here after Chief Engineer approval.');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-8">
          {showCreateForm ? (
            <>
              {/* Back to Dashboard Button */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <CreateProject onProjectCreate={handleProjectCreated} />
            </>
          ) : !selectedProject ? (
            <>
              {/* Section Title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Projects & Overview
                </h2>
                {showCreateProject && (
                  <button
                    onClick={handleCreateProject}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                    Create Project
                  </button>
                )}
              </div>

              {/* Project Cards */}
              <ProjectList
                projects={filteredProjects}
                onSelect={setSelectedProject}
                selectedProject={selectedProject}
              />
            </>
          ) : (
            <>
              {/* Plans for selected project */}
              <PlanProgressList
                plans={filteredPlans}
                onPlanSelect={setSelectedPlan}
                selectedPlan={selectedPlan}
              />
              {showProjectOptions && (
                <ProjectOptionButtons
                  onAction={handleProjectAction}
                  selectedProject={selectedProject}
                />
              )}
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-1 space-y-6">
          {!showCreateForm && (
            <>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder={
                  !selectedProject 
                    ? "Search projects..." 
                    : "Search plans..."
                }
              />

              {selectedProject && <ProjectDetails project={selectedProject} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
