import { useState, useMemo } from "react";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import ProjectOptionButtons from "../../components/ProjectOptionButtons";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import BreadcrumbsNav from "../../components/BreadcrumbsNav";
import { plansData, projectsData } from "../../data/mockData";


const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projectsData;
    return projectsData.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm]);

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
        alert("Create new project functionality will be implemented");
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
      <BreadcrumbsNav
        selectedProject={selectedProject}
        onBack={handleBackToProjects}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-8">
          {!selectedProject ? (
            <>
              {/* Section Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Projects & Overview
              </h2>

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
            placeholder={!selectedProject ? "Search projects..." : "Search plans..."}
          />

          {selectedProject && <ProjectDetails project={selectedProject} />}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;