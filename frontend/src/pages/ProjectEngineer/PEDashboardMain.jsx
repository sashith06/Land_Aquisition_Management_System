import { useState, useMemo, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import ProjectOptionButtons from "../../components/ProjectOptionButtons";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import { plansData, projectsData } from "../../data/mockData";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PEDashboardMain = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProjects, setAllProjects] = useState(projectsData);

  // Load approved projects from localStorage
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
    setAllProjects([...projectsData, ...savedProjects]);
  }, []);

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

  const handleProjectAction = (action) => {
    switch (action) {
      case "create":
        navigate("/pe-dashboard/create-project");
        break;
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
              <ProjectOptionButtons
                onAction={handleProjectAction}
                selectedProject={selectedProject}
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
