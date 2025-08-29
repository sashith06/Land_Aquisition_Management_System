import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, UserCheck, Search, Users, FolderOpen, CheckCircle, AlertCircle, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsData } from '../../data/mockData'; // Import mock projects data

const ProjectAssignment = () => {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState([]); // Changed from approvedProjects to allProjects
  const [landOfficers, setLandOfficers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState(null); // Changed from selectedOfficers array to single officer
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState(''); // New search term for projects
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    projectId: '',
    officerId: ''
  });

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Refresh projects when localStorage changes (like PE Dashboard does)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      const allProjectsFromDashboard = [...projectsData, ...savedProjects];
      setAllProjects(allProjectsFromDashboard);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadData = () => {
    try {
      // Load all projects from Projects & Overview (same as PE Dashboard)
      const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      const allProjectsFromDashboard = [...projectsData, ...savedProjects];
      setAllProjects(allProjectsFromDashboard);

      // Load approved land officers from UserManagement localStorage
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
      
      // Filter only Land Officers from approved users and remove duplicates
      const approvedLandOfficers = approvedUsers.filter(user => 
        user.role === 'Land Officer' && (user.status === 'Active' || !user.status)
      );
      
      // Remove duplicates based on email (primary key)
      const uniqueLandOfficers = approvedLandOfficers.filter((user, index, self) =>
        index === self.findIndex(u => u.email === user.email)
      );
      
      // Debug log to check what we're getting
      console.log('Approved Users from localStorage:', approvedUsers);
      console.log('Filtered Land Officers:', approvedLandOfficers);
      console.log('Unique Land Officers:', uniqueLandOfficers);
      
      // Set land officers
      setLandOfficers(uniqueLandOfficers);

      // Load existing assignments
      const savedAssignments = JSON.parse(localStorage.getItem('projectAssignments') || '[]');
      setAssignments(savedAssignments);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Filter land officers based on search term
  const filteredOfficers = useMemo(() => {
    if (!searchTerm.trim()) return landOfficers;
    const term = searchTerm.toLowerCase();
    return landOfficers.filter(officer => 
      officer.name.toLowerCase().includes(term) ||
      officer.email.toLowerCase().includes(term) ||
      officer.department.toLowerCase().includes(term)
    );
  }, [landOfficers, searchTerm]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!projectSearchTerm.trim()) return allProjects;
    const term = projectSearchTerm.toLowerCase();
    return allProjects.filter(project => 
      (project.projectName || project.name || '').toLowerCase().includes(term) ||
      (project.estimatedCost || '').toLowerCase().includes(term)
    );
  }, [allProjects, projectSearchTerm]);

  // Handle officer selection (single selection)
  const handleOfficerSelect = (officer) => {
    setSelectedOfficer(officer);
    // Clear project selection when changing officer
    setSelectedProject(null);
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  // Handle project assignment
  const handleAssignProject = () => {
    if (!selectedProject || !selectedOfficer) {
      alert('Please select both a land officer and a project');
      return;
    }

    const newAssignment = {
      id: Date.now(),
      projectId: selectedProject.id,
      projectName: selectedProject.projectName || selectedProject.name,
      assignedOfficers: [selectedOfficer], // Keep as array for compatibility
      assignedBy: 'Project Engineer',
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'assigned',
      notes: ''
    };

    // Save assignment to localStorage
    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    localStorage.setItem('projectAssignments', JSON.stringify(updatedAssignments));

    // Reset selections
    setSelectedProject(null);
    setSelectedOfficer(null);
    
    alert(`Project "${newAssignment.projectName}" has been successfully assigned to ${selectedOfficer.name}`);
  };

  // Check if project is already assigned
  const isProjectAssigned = (projectId) => {
    return assignments.some(assignment => assignment.projectId === projectId);
  };

  // Get assigned officers for a project
  const getAssignedOfficers = (projectId) => {
    const assignment = assignments.find(a => a.projectId === projectId);
    return assignment ? assignment.assignedOfficers : [];
  };

  const handleEditAssignment = (assignment) => {
    console.log('Editing assignment:', assignment);
    setEditingAssignment(assignment.id);
    setEditFormData({
      projectId: assignment.projectId.toString(),
      officerId: assignment.assignedOfficers[0]?.id.toString() || ''
    });
    console.log('Edit form data set to:', {
      projectId: assignment.projectId.toString(),
      officerId: assignment.assignedOfficers[0]?.id.toString() || ''
    });
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    console.log('Edit form data:', editFormData);
    console.log('All projects:', allProjects);
    console.log('Land officers:', landOfficers);
    
    try {
      const selectedEditProject = allProjects.find(p => p.id.toString() === editFormData.projectId.toString());
      const selectedEditOfficer = landOfficers.find(u => u.id.toString() === editFormData.officerId.toString());
      
      console.log('Selected project:', selectedEditProject);
      console.log('Selected officer:', selectedEditOfficer);
      
      if (!selectedEditProject || !selectedEditOfficer) {
        alert('Please select both project and officer');
        setSavingEdit(false);
        return;
      }
      
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === editingAssignment 
          ? {
              ...assignment,
              projectId: selectedEditProject.id,
              projectName: selectedEditProject.projectName || selectedEditProject.name,
              assignedOfficers: [selectedEditOfficer],
              lastModified: new Date().toISOString().split('T')[0]
            }
          : assignment
      );
      
      console.log('Updated assignments:', updatedAssignments);
      
      // Small delay to ensure localStorage write completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setAssignments(updatedAssignments);
      localStorage.setItem('projectAssignments', JSON.stringify(updatedAssignments));
      
      // Reset edit state
      setEditingAssignment(null);
      setEditFormData({ projectId: '', officerId: '' });
      setSavingEdit(false);
      
      alert('Assignment updated successfully!');
    } catch (error) {
      console.error('Error saving assignment:', error);
      setSavingEdit(false);
      alert('Error updating assignment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setEditFormData({ projectId: '', officerId: '' });
  };

  const handleDeleteAssignment = (assignmentId, projectName) => {
    if (window.confirm(`Are you sure you want to delete the assignment for "${projectName}"? This action cannot be undone.`)) {
      const updatedAssignments = assignments.filter(assignment => assignment.id !== assignmentId);
      setAssignments(updatedAssignments);
      localStorage.setItem('projectAssignments', JSON.stringify(updatedAssignments));
      alert(`Assignment for "${projectName}" has been deleted successfully.`);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={() => navigate('/pe-dashboard')}
                className="text-gray-500 hover:text-orange-500 font-medium transition-colors"
              >
                Projects & Overview
              </button>
              <span className="text-gray-400">›</span>
              <span className="text-orange-500 font-medium">Project Assignment</span>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Project Assignment
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Step 1: Select a land officer, then Step 2: Choose a project to assign
          </p>
          {landOfficers.length === 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> To assign projects, land officers must first be approved by the Chief Engineer in User Management.
              </p>
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
                    <p className="font-medium mb-2">No approved land officers available</p>
                    <p className="text-sm">
                      Land officers must be approved by the Chief Engineer in User Management before they can be assigned to projects.
                    </p>
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
                        <img
                          src={officer.avatar}
                          alt={officer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{officer.name}</h3>
                          <p className="text-sm text-gray-600">{officer.email}</p>
                          <p className="text-xs text-gray-400">{officer.department}</p>
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
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <FolderOpen className="text-blue-600" size={20} />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Select Project for {selectedOfficer.name}
                  </h2>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    {allProjects.length === 0 ? (
                      <p>No projects available in Projects & Overview</p>
                    ) : (
                      <p>No projects match your search criteria</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProjects.map((project) => {
                      const assigned = isProjectAssigned(project.id);
                      const assignedOfficers = getAssignedOfficers(project.id);
                      const isSelected = selectedProject?.id === project.id;
                      
                      return (
                        <div
                          key={project.id}
                          onClick={() => !assigned && handleProjectSelect(project)}
                          className={`p-4 border rounded-lg transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : assigned
                              ? 'border-green-200 bg-green-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {project.projectName || project.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Cost: {project.estimatedCost}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Created: {project.createdDate}
                              </p>
                            </div>
                            
                            {assigned && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle size={16} />
                                <span className="text-xs font-medium">
                                  Assigned ({assignedOfficers.length})
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {assigned && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-green-700 font-medium">Assigned to:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {assignedOfficers.map((officer, index) => (
                                  <span
                                    key={officer.id}
                                    className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                  >
                                    {officer.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <UserCheck size={20} />
                  <span>
                    Assign "{selectedProject.projectName || selectedProject.name}" to {selectedOfficer.name}
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
                  Choose a land officer from the left panel to see all projects from Projects & Overview for assignment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Assignments Summary */}
      {assignments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Assignment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                {editingAssignment === assignment.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <select
                        value={editFormData.projectId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, projectId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Project</option>
                        {allProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.projectName || project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Land Officer
                      </label>
                      <select
                        value={editFormData.officerId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, officerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Officer</option>
                        {landOfficers.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className={`flex items-center gap-1 px-3 py-1 text-white text-sm rounded transition-colors ${
                          savingEdit 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Save size={14} />
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{assignment.projectName}</h4>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Assignment"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id, assignment.projectName)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Assigned: {assignment.assignedDate}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {assignment.assignedOfficers.map((officer) => (
                        <span
                          key={officer.id}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {officer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignment;
