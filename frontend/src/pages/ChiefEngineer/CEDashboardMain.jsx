import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../api';
import PlanList from '../../components/PlanList';
import ProjectList from '../../components/ProjectList';
import ProjectDetails from '../../components/ProjectDetails';
import PlanProgressList from '../../components/PlanProgressList';
import SearchBar from '../../components/SearchBar';

// Header component for the dashboard
const CEDashboardHeader = () => (
  <div className="mb-6 sm:mb-8">
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
      Chief Engineer Dashboard
    </h1>
    <p className="text-sm sm:text-base text-slate-600">
      Overview and management of all land acquisition projects
    </p>
  </div>
);

// Main content grid component - Shows projects and plans
const MainContent = ({ filteredProjects, filteredPlans, selectedProject, selectedPlan, onProjectSelect, onPlanSelect, onBackToProjects }) => (
  <div className="space-y-6 sm:space-y-8">
    {!selectedProject ? (
      <>
        {/* Project List */}
        <ProjectList
          projects={filteredProjects}
          onSelect={onProjectSelect}
          selectedProject={selectedProject}
        />
        
        {/* Project Summary Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredProjects.length}</div>
              <div className="text-sm text-slate-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredProjects.filter(p => p.progress >= 75).length}
              </div>
              <div className="text-sm text-slate-600">Near Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredProjects.filter(p => p.progress >= 25 && p.progress < 75).length}
              </div>
              <div className="text-sm text-slate-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredProjects.filter(p => p.progress < 25).length}
              </div>
              <div className="text-sm text-slate-600">Early Stage</div>
            </div>
          </div>
        </div>
      </>
    ) : (
      <>
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={onBackToProjects}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* Plans for selected project */}
        <PlanProgressList
          plans={filteredPlans}
          onPlanSelect={onPlanSelect}
          selectedPlan={selectedPlan}
        />
      </>
    )}
  </div>
);

// Sidebar component
const CEDashboardSidebar = ({ searchTerm, onSearchChange, selectedProject, selectedPlan }) => (
  <div className="space-y-6">
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder={
        !selectedProject ? "Search projects..." : "Search plans..."
      }
    />
    
    <ProjectDetails project={selectedProject || selectedPlan} />
  </div>
);

const CEDashboardMain = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
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
      // Find the project that contains the plan with the given planId
      const planId = location.state.planId;
      // Load plans for all projects to find the matching plan
      const loadPlansAndFindProject = async () => {
        try {
          // Load all plans to find the matching plan
          const plansResponse = await api.get('/api/plans');
          const allPlansData = plansResponse.data;
          const plan = allPlansData.find(p => p.id === parseInt(planId));
          if (plan) {
            const project = allProjects.find(proj => proj.id === plan.project_id);
            if (project) {
              setSelectedProject(project);
              loadPlansForProject(project.id);
            }
          }
        } catch (error) {
          console.error('Error loading plans for navigation:', error);
        }
      };

      if (allProjects.length > 0) {
        loadPlansAndFindProject();
      }
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

  // Memoized filtered plans for selected project
  const filteredPlans = useMemo(() => {
    if (!selectedProject) return [];
    const term = searchTerm.trim();
    return allPlans.filter(
      (plan) =>
        plan.project_id === selectedProject.id &&
        (!term || plan.plan_number.toLowerCase().includes(term.toLowerCase()) ||
         plan.description?.toLowerCase().includes(term.toLowerCase()))
    );
  }, [searchTerm, selectedProject, allPlans]);

  // Load plans for selected project
  const loadPlansForProject = async (projectId) => {
    try {
      const response = await api.get(`/api/plans/project/${projectId}`);
      setAllPlans(response.data);
    } catch (error) {
      console.error('Error loading plans for project:', error);
      setAllPlans([]);
    }
  };

  const handleProjectSelect = (project) => {
    console.log('Project selected for viewing:', project);
    setSelectedProject(project);
    setSelectedPlan(null); // Reset plan selection when project changes
    loadPlansForProject(project.id); // Load plans for the selected project
  };

  const handlePlanSelect = (plan) => {
    console.log('Plan selected for viewing:', plan);
    setSelectedPlan(plan);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedPlan(null);
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <CEDashboardHeader />
      
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
              filteredPlans={filteredPlans}
              selectedProject={selectedProject}
              selectedPlan={selectedPlan}
              onProjectSelect={handleProjectSelect}
              onPlanSelect={handlePlanSelect}
              onBackToProjects={handleBackToProjects}
            />
          </div>
          {/* Right Sidebar */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <CEDashboardSidebar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedProject={selectedProject}
              selectedPlan={selectedPlan}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CEDashboardMain;
