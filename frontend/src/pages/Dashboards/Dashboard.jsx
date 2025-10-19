import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import Breadcrumb from "../../components/Breadcrumb";
import SearchBar from "../../components/SearchBar";
import ProjectDetails from "../../components/ProjectDetails";
import PlanProgressList from "../../components/PlanProgressList";
import ProjectList from "../../components/ProjectList";
import { plansData } from "../../data/mockData";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProjects, setAllProjects] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [myPlans, setMyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const messageShownRef = useRef(false); // Track if message has been shown

  // Get user role from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Load data based on user role
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (userRole === 'land_officer') {
          // Load all approved projects but also get assigned projects for validation
          const [allProjectsResponse, assignedProjectsResponse, plansResponse] = await Promise.all([
            api.get('/api/projects/approved'),
            api.get('/api/plans/assigned/projects'),
            api.get('/api/plans/my-plans')
          ]);
          
          setAllProjects(allProjectsResponse.data || []);
          setAssignedProjects(assignedProjectsResponse.data || []);
          setMyPlans(plansResponse.data || []);
        } else {
          // Load all approved projects for other roles
          const response = await api.get('/api/projects/approved');
          setAllProjects(response.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setAllProjects([]);
        setAssignedProjects([]);
        setMyPlans([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadData();
    }
  }, [userRole]);

  // Handle navigation state when returning from lots page
  useEffect(() => {
    if (location.state?.returnToProject && location.state?.planId) {
      const planId = location.state.planId;
      const plan = plansData.find(p => p.id === planId);
      if (plan) {
        const project = allProjects.find(proj => proj.id === plan.projectId);
        if (project) {
          setSelectedProject(project);
        }
      }
    }
    
    // Handle success message from plan creation - prevent multiple alerts
    if (location.state?.message && !messageShownRef.current) {
      messageShownRef.current = true;
      
      // Use setTimeout to ensure proper timing and prevent multiple calls
      setTimeout(() => {
        alert(location.state.message);
        
        // Handle returning to specific project after plan creation
        if (location.state?.returnToProject && location.state?.projectId) {
          const project = allProjects.find(proj => proj.id.toString() === location.state.projectId.toString());
          if (project) {
            setSelectedProject(project);
          }
        }
        
        // Clear the location state to prevent repeated alerts
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
  }, [location.state, allProjects, navigate, location.pathname]);

  // Reset message shown ref when location changes (for subsequent plan creations)
  useEffect(() => {
    if (!location.state?.message) {
      messageShownRef.current = false;
    }
  }, [location.pathname, location.state?.message]);

  // Check dashboard type
  const isChiefEngineerDashboard = location.pathname.startsWith('/ce-dashboard');
  const isLandOfficerDashboard = userRole === 'land_officer' && location.pathname.startsWith('/dashboard');

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    // For land officers, show all projects but they can only create plans for assigned ones
    const projectsToFilter = allProjects;
    if (!term) return projectsToFilter;
    return projectsToFilter.filter((p) => p.name.toLowerCase().includes(term));
  }, [searchTerm, allProjects]);

  const filteredPlans = useMemo(() => {
    if (!selectedProject) return [];
    const term = searchTerm.trim();
    
    // For land officers, show their created plans for the selected project
    if (userRole === 'land_officer') {
      const projectPlans = myPlans.filter(plan => plan.project_id === selectedProject.id);
      if (!term) return projectPlans;
      return projectPlans.filter(plan => 
        plan.plan_no?.toLowerCase().includes(term.toLowerCase()) ||
        plan.cadastral_no?.toLowerCase().includes(term.toLowerCase()) ||
        plan.description?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // For other roles, use mock data (can be replaced with API call)
    return plansData.filter(
      (plan) =>
        plan.projectId === selectedProject.id &&
        (!term || plan.id.includes(term))
    );
  }, [searchTerm, selectedProject, myPlans, userRole]);

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedPlan(null);
    setSearchTerm("");
  };

  const handlePlanCreated = () => {
    // Reload plans after creation
    if (userRole === 'land_officer') {
      api.get('/api/plans/my-plans').then(response => {
        setMyPlans(response.data || []);
      }).catch(console.error);
    }
  };

  // Add refresh functionality for real-time updates
  const refreshProgressData = async () => {
    if (userRole === 'land_officer') {
      try {
        setLoading(true);
        const response = await api.get('/api/plans/my-plans');
        setMyPlans(response.data || []);
      } catch (error) {
        console.error('Error refreshing progress data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreatePlan = () => {
    if (selectedProject) {
      navigate(`/dashboard/create-plan?project=${selectedProject.id}`);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // If land officer, show create plan option
  };

  // Check if current land officer is assigned to the selected project
  const isAssignedToProject = (projectId) => {
    if (userRole !== 'land_officer') return true; // Other roles can always view
    return assignedProjects.some(project => project.id === projectId);
  };

  const canCreatePlan = selectedProject && isAssignedToProject(selectedProject.id);

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      ) : (
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
              ) : isLandOfficerDashboard ? (
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Land Officer Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Manage assigned projects and create plans
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
                onSelect={handleProjectSelect}
                selectedProject={selectedProject}
                assignedProjects={assignedProjects}
                userRole={userRole}
              />
            </>
          ) : (
            <>
              {/* Header with Breadcrumb navigation and Create Plan Button */}
              <div className="flex justify-between items-center mb-6">
                <Breadcrumb
                  items={[
                    { label: isLandOfficerDashboard ? "All Projects" : "Projects & Overview", onClick: handleBackToProjects }
                  ]}
                />
                
                {/* Create Plan Button and Refresh Button for Land Officers */}
                {isLandOfficerDashboard && (
                  <div className="flex items-center space-x-3">
                    {/* Refresh Progress Button */}
                    <button
                      onClick={refreshProgressData}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh progress data"
                    >
                      <svg 
                        className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                        />
                      </svg>
                      <span>Refresh</span>
                    </button>
                    
                    {/* Create Plan Button */}
                    {canCreatePlan ? (
                      <button
                        onClick={handleCreatePlan}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <Plus size={20} />
                        <span>Create Plan</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                        <Plus size={20} />
                        <span>Not Assigned to Project</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Plans for selected project */}
              <PlanProgressList
                plans={filteredPlans}
                onPlanSelect={setSelectedPlan}
                selectedPlan={selectedPlan}
                showProgress={!isLandOfficerDashboard}
              />
              
              {/* Empty state for land officers with no plans */}
              {isLandOfficerDashboard && filteredPlans.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  {canCreatePlan ? (
                    <>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Plans Created Yet</h3>
                      <p className="text-gray-500 mb-6">
                        Start by creating your first plan for this project
                      </p>
                      <button
                        onClick={handleCreatePlan}
                        className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto"
                      >
                        <Plus size={20} />
                        <span>Create First Plan</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Plans Available</h3>
                      <p className="text-gray-500 mb-6">
                        You are not assigned to this project, so you cannot create plans here.
                      </p>
                      <div className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-lg mx-auto cursor-not-allowed">
                        <Plus size={20} />
                        <span>Not Assigned to Project</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-1 space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={
              !selectedProject 
                ? (isLandOfficerDashboard ? "Search all projects..." : "Search projects...")
                : "Search plans..."
            }
          />

          {selectedProject && <ProjectDetails project={selectedProject} />}
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
