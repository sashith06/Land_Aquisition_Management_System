import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import { plansData, projectsData } from "../../data/mockData";

const Dashboard = () => {
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

  // Check if we're on the Chief Engineer dashboard
  const isChiefEngineerDashboard = location.pathname.startsWith('/ce-dashboard');

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
              {/* Section Title */}
              {isChiefEngineerDashboard ? (
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Chief Engineer Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Overview and management of all land acquisition projects
                  </p>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Projects & Overview
                </h2>
              )}

              {/* Project Cards */}
              <ProjectList
                projects={filteredProjects}
                onSelect={setSelectedProject}
                selectedProject={selectedProject}
              />
            </>
          ) : (
            <>
              {/* Breadcrumb navigation for Plans & Progress */}
              <Breadcrumb
                items={[
                  { label: "Projects & Overview", onClick: handleBackToProjects },
                  { label: "Plans & Progress" }
                ]}
              />
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

export default Dashboard;
