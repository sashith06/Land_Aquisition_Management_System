import { useState, useMemo, useEffect } from "react";
import { DollarSign, ArrowLeft } from "lucide-react";
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

  const handleProjectAction = (action) => {
    switch (action) {
      case "financial":
        if (selectedProject) {
          navigate(`/fo-dashboard/financial-details/${selectedProject.id}`);
        }
        break;
      case "view":
        if (selectedProject) alert(`View project: ${selectedProject.name}`);
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
              <FOProjectActionButtons
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

// Financial Officer specific action buttons
const FOProjectActionButtons = ({ onAction, selectedProject }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Financial Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onAction("financial")}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <DollarSign size={16} />
          <span>Add Financial Details</span>
        </button>
        <button
          onClick={() => onAction("view")}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>View Details</span>
        </button>
      </div>
      {selectedProject && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected Project:</strong> {selectedProject.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default FODashboardMain;
