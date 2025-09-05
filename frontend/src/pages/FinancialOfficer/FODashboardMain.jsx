import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import { plansData, projectsData } from "../../data/mockData";

const FODashboardMain = () => {
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

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-8">
          {!selectedProject ? (
            <>
              {/* Section Title and Add Financial Details Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Projects & Financial Overview
                </h2>
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
              {/* Breadcrumb Navigation */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    onClick={handleBackToProjects}
                    className="text-gray-500 hover:text-orange-500 font-medium transition-colors"
                  >
                    Projects & Financial Overview
                  </button>
                  <span className="text-gray-400">›</span>
                  <span className="text-orange-500 font-medium">Plans & Progress</span>
                </div>
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

export default FODashboardMain;
