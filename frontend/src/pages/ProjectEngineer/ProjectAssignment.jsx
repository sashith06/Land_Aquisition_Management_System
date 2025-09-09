import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, UserCheck, Search, Users, FolderOpen, CheckCircle, AlertCircle, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import api from '../../api';

const ProjectAssignment = () => {
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [allProjects, setAllProjects] = useState([]);
  const [landOfficers, setLandOfficers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [projectAssignments, setProjectAssignments] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading project assignment data...');
      
      // Load only approved projects created by current user (project engineer)
      console.log('Fetching approved projects for assignment...');
      const projectsResponse = await api.get('/api/projects/approved-for-assignment');
      console.log('Approved projects loaded:', projectsResponse.data.length, 'projects');
      setAllProjects(projectsResponse.data);

      // Load approved land officers from API
      console.log('Fetching approved land officers...');
      const officersResponse = await api.get('/api/assignments/land-officers');
      console.log('Land officers loaded:', officersResponse.data.length, 'officers');
      setLandOfficers(officersResponse.data);

      // Load project assignment information for each project
      const assignmentPromises = projectsResponse.data.map(async (project) => {
        try {
          const assignmentResponse = await api.get(`/api/assignments/project/${project.id}`);
          return {
            projectId: project.id,
            assignments: assignmentResponse.data
          };
        } catch (error) {
          // If no assignments found, that's okay
          return {
            projectId: project.id,
            assignments: []
          };
        }
      });

      const assignmentResults = await Promise.all(assignmentPromises);
      const assignmentMap = {};
      assignmentResults.forEach(result => {
        assignmentMap[result.projectId] = result.assignments;
      });
      setProjectAssignments(assignmentMap);

    } catch (error) {
      console.error('Error loading data:', error);
      
      let errorMessage = 'Failed to load data. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const responseError = error.response.data.error;
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in as a Project Engineer and try again.';
          // Redirect to login after showing error
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (status === 403) {
          errorMessage = 'Access denied. You must be logged in as a Project Engineer to assign projects.';
        } else if (responseError) {
          errorMessage = responseError;
        }
        
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Network error. Please check if the server is running.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter land officers based on search term
  const filteredOfficers = useMemo(() => {
    if (!searchTerm.trim()) return landOfficers;
    const term = searchTerm.toLowerCase();
    return landOfficers.filter(officer => 
      `${officer.first_name} ${officer.last_name}`.toLowerCase().includes(term) ||
      officer.email.toLowerCase().includes(term) ||
      (officer.department && officer.department.toLowerCase().includes(term))
    );
  }, [landOfficers, searchTerm]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projectSearchTerm.trim()) return allProjects;
    const term = projectSearchTerm.toLowerCase();
    return allProjects.filter(project => 
      project.name.toLowerCase().includes(term) ||
      project.initial_estimated_cost.toString().includes(term)
    );
  }, [allProjects, projectSearchTerm]);

  // Handle officer selection
  const handleOfficerSelect = (officer) => {
    setSelectedOfficer(officer);
    setSelectedProject(null);
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  // Handle project assignment
  const handleAssignProject = async () => {
    if (!selectedProject || !selectedOfficer) {
      alert('Please select both a land officer and a project');
      return;
    }

    setAssignLoading(true);
    try {
      const response = await api.post('/api/assignments/assign', {
        projectId: selectedProject.id,
        landOfficerId: selectedOfficer.id
      });

      // Reload data to reflect changes
      await loadData();
      
      // Reset selections
      setSelectedProject(null);
      setSelectedOfficer(null);
      
      // Show success message with notification info
      alert(`✅ Assignment Successful!\n\n${response.data.message}\n\nA notification has been sent to ${selectedOfficer.first_name} ${selectedOfficer.last_name} about this assignment.`);
    } catch (error) {
      console.error('Error assigning project:', error);
      
      // Handle specific error for unapproved projects
      if (error.response?.data?.error?.includes('approved by Chief Engineer')) {
        alert(`❌ Assignment Failed!\n\n${error.response.data.error}\n\nProject Status: ${error.response.data.currentStatus || 'Unknown'}\n\nPlease wait for Chief Engineer approval before attempting assignment.`);
      } else {
        alert(error.response?.data?.error || 'Failed to assign project. Please try again.');
      }
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Project Assignment
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Assign approved projects to Land Officers. Only projects approved by the Chief Engineer can be assigned.
          </p>
          {landOfficers.length === 0 && (
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    No Land Officers Available for Assignment
                  </p>
                  <p className="text-sm text-amber-700">
                    To assign projects, land officers must first:
                  </p>
                  <ol className="text-sm text-amber-700 mt-1 ml-4 list-decimal">
                    <li>Register in the system with role "Land Officer"</li>
                    <li>Be approved by the Chief Engineer in User Management</li>
                  </ol>
                  <p className="text-sm text-amber-700 mt-2">
                    <strong>Next Step:</strong> Contact your Chief Engineer to review and approve land officer registrations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Land Officers */}
        <div className="space-y-6">
          {/* Search for Officers */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search land officers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Land Officers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="text-green-600" size={20} />
                <h2 className="text-xl font-semibold text-slate-900">Select Land Officer</h2>
              </div>
              {selectedOfficer && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Selected: {selectedOfficer.name}
                </span>
              )}
            </div>

              {filteredOfficers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  {landOfficers.length === 0 ? (
                    <div>
                      <p className="font-medium mb-2">No Approved Land Officers Available</p>
                      <p className="text-sm mb-3">
                        Land officers must be registered and approved by the Chief Engineer before they can be assigned to projects.
                      </p>
                      <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded border">
                        <p className="font-medium mb-1">Steps to get land officers:</p>
                        <p>1. Users register with "Land Officer" role</p>
                        <p>2. Chief Engineer approves them in User Management</p>
                        <p>3. Approved officers appear here for assignment</p>
                      </div>
                    </div>
                  ) : (
                    <p>No land officers match your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredOfficers.map((officer) => {
                    const isSelected = selectedOfficer?.id === officer.id;
                    
                    return (
                      <div
                        key={officer.id}
                        onClick={() => handleOfficerSelect(officer)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {officer.first_name.charAt(0)}{officer.last_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {officer.first_name} {officer.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{officer.email}</p>
                            {officer.department && (
                              <p className="text-xs text-gray-400">{officer.department}</p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle className="text-green-600" size={20} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* Right Column - Projects (only show if officer is selected) */}
        <div className="space-y-6">
          {selectedOfficer ? (
            <>
              {/* Search for Projects */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Projects */}
              {/* Projects */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <FolderOpen className="text-blue-600" size={20} />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Select Approved Project for {selectedOfficer.first_name} {selectedOfficer.last_name}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Only projects approved by the Chief Engineer are available for assignment.
                </p>

                {/* Color Legend */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
                      <span className="text-gray-600">Unassigned Project</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-green-300 bg-green-50 rounded"></div>
                      <span className="text-gray-600">Already Assigned</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
                      <span className="text-gray-600">Selected Project</span>
                    </div>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    {allProjects.length === 0 ? (
                      <div>
                        <p className="font-medium mb-2">No Approved Projects Available for Assignment</p>
                        <p className="text-sm mb-3">
                          Only projects approved by the Chief Engineer can be assigned to Land Officers.
                        </p>
                        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded border">
                          <p className="font-medium mb-1">To assign projects:</p>
                          <p>1. Create projects in the Projects dashboard</p>
                          <p>2. Wait for Chief Engineer approval</p>
                          <p>3. Approved projects will appear here for assignment</p>
                        </div>
                      </div>
                    ) : (
                      <p>No projects match your search criteria</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProjects.map((project) => {
                      const isSelected = selectedProject?.id === project.id;
                      const assignments = projectAssignments[project.id] || [];
                      const isAssigned = assignments.length > 0;
                      
                      return (
                        <div
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isAssigned
                              ? 'border-green-300 bg-green-50 hover:border-green-400'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">
                                  {project.name}
                                </h3>
                                {isAssigned && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                    Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Cost: ${project.initial_estimated_cost}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Status: <span className="capitalize">{project.status}</span>
                              </p>
                              {isAssigned && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                  <p className="text-xs text-green-700 font-medium">
                                    Assigned to: {assignments.map(a => `${a.first_name} ${a.last_name}`).join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <CheckCircle className="text-blue-600" size={20} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Button */}
              {selectedProject && (
                <button
                  onClick={handleAssignProject}
                  disabled={assignLoading}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                    assignLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <UserCheck size={20} />
                  <span>
                    {assignLoading 
                      ? 'Assigning...' 
                      : `Assign "${selectedProject.name}" to ${selectedOfficer.first_name} ${selectedOfficer.last_name}`
                    }
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="text-center py-8 text-gray-500">
                <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">Select a Land Officer First</p>
                <p className="text-sm">
                  Choose a land officer from the left panel to see available projects for assignment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignment;
