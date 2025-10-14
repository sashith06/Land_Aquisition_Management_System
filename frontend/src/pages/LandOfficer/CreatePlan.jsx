import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const CreatePlan = () => {
  const [searchParams] = useSearchParams();
  const { projectId: urlProjectId, id: planId } = useParams(); // Get planId for edit mode
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const projectFromQuery = searchParams.get('project');
  
  // Determine if we're in edit mode
  const isEditMode = Boolean(planId);
  const initialProjectId = urlProjectId || projectFromQuery;

  const [formData, setFormData] = useState({
    project_id: initialProjectId || '',
    plan_identifier: '',
    description: '',
    estimated_cost: '',
    estimated_extent: '',
    advance_tracing_no: '',
    divisional_secretary: '',
    current_extent_value: '',
    section_07_gazette_no: '',
    section_07_gazette_date: '',
    section_38_gazette_no: '',
    section_38_gazette_date: '',
    section_5_gazette_no: '',
    pending_cost_estimate: ''
  });

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
  const [originalPlan, setOriginalPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadAssignedProjects();
    if (isEditMode && planId) {
      loadPlanForEdit();
    }
  }, []);

  useEffect(() => {
    if (initialProjectId && assignedProjects.length > 0) {
      const project = assignedProjects.find(p => p.id.toString() === initialProjectId);
      if (project) {
        setSelectedProject(project);
        setFormData(prev => ({ ...prev, project_id: initialProjectId }));
        // Load project details for advance tracing numbers
        loadProjectDetails(initialProjectId);
      }
    }
  }, [initialProjectId, assignedProjects]);

  const loadAssignedProjects = async () => {
    try {
      const response = await api.get('/api/plans/assigned/projects');
      setAssignedProjects(response.data);
    } catch (error) {
      console.error('Error loading assigned projects:', error);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}`);
      setSelectedProjectDetails(response.data);
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const loadPlanForEdit = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/plans/${planId}`);
      const plan = response.data;
      
      setOriginalPlan(plan);
      setFormData({
        project_id: plan.project_id || '',
        plan_identifier: plan.plan_no || plan.cadastral_no || '',
        description: plan.description || '',
        estimated_cost: plan.estimated_cost || '',
        estimated_extent: plan.estimated_extent || '',
        advance_tracing_no: plan.advance_tracing_no || '',
        divisional_secretary: plan.divisional_secretary || '',
        current_extent_value: plan.current_extent_value || '',
        section_07_gazette_no: plan.section_07_gazette_no || '',
        section_07_gazette_date: plan.section_07_gazette_date ? plan.section_07_gazette_date.split('T')[0] : '',
        section_38_gazette_no: plan.section_38_gazette_no || '',
        section_38_gazette_date: plan.section_38_gazette_date ? plan.section_38_gazette_date.split('T')[0] : '',
        section_5_gazette_no: plan.section_5_gazette_no || '',
        pending_cost_estimate: plan.pending_cost_estimate || ''
      });
    } catch (error) {
      console.error('Error loading plan:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to edit this plan');
      } else if (error.response?.status === 404) {
        alert('Plan not found');
      } else {
        alert('Error loading plan details');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToProjectPlans = () => {
    // Navigate to the specific project's plans page
    const projectId = formData.project_id || initialProjectId;
    if (projectId) {
      // Get project name from selectedProject or selectedProjectDetails
      const projectName = selectedProject?.project_name || 
                         selectedProjectDetails?.project_name || 
                         'Project';
      
      navigate(`/dashboard/project/${projectId}/plans`, {
        state: { projectName }
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Update selected project when project changes
    if (name === 'project_id') {
      const project = assignedProjects.find(p => p.id.toString() === value);
      setSelectedProject(project);
      // Load project details for advance tracing numbers
      if (value) {
        loadProjectDetails(value);
        // Clear advance_tracing_no when project changes
        setFormData(prev => ({ ...prev, advance_tracing_no: '' }));
      } else {
        setSelectedProjectDetails(null);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.plan_identifier.trim()) newErrors.plan_identifier = 'Plan No / Cadastral No is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Handle the single plan identifier field
      // Send it as plan_no and leave cadastral_no as null
      const processedData = { ...formData };
      processedData.plan_no = processedData.plan_identifier;
      processedData.cadastral_no = null;
      delete processedData.plan_identifier;

      let response;
      if (isEditMode) {
        // Update existing plan
        response = await api.put(`/api/plans/${planId}`, processedData);
      } else {
        // Create new plan
        response = await api.post('/api/plans/create', processedData);
      }
      
      if (response.data) {
        alert(isEditMode ? 'Plan updated successfully!' : 'Plan created successfully!');
        // Redirect to the specific project's plans page after successful creation/update
        navigateToProjectPlans();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} plan:`, error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Plan with this Plan No already exists')) {
          setErrors({ 
            plan_identifier: 'This Plan No / Cadastral No already exists in this project'
          });
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert(`Error ${isEditMode ? 'updating' : 'creating'} plan. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigateToProjectPlans();
  };

  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      plan_identifier: '',
      description: '',
      estimated_cost: '',
      estimated_extent: '',
      advance_tracing_no: '',
      divisional_secretary: '',
      current_extent_value: '',
      section_07_gazette_no: '',
      section_07_gazette_date: '',
      section_38_gazette_no: '',
      section_38_gazette_date: '',
      section_5_gazette_no: '',
      pending_cost_estimate: ''
    }));
    setErrors({});
  };

  // Show loading state when editing and plan data is being loaded
  if (isEditMode && loading && !originalPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit Plan: ${originalPlan?.plan_no || originalPlan?.cadastral_no || planId}` : 'Create Plan'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update the plan details' : 'Create a new plan for your assigned project'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Details Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              📄 Plan Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.project_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Project</option>
                  {assignedProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan No / Cadastral No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="plan_identifier"
                  value={formData.plan_identifier}
                  onChange={handleInputChange}
                  placeholder="Enter Plan Number or Cadastral Number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.plan_identifier ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.plan_identifier && <p className="text-red-500 text-sm mt-1">{errors.plan_identifier}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter either a Plan Number (e.g., P001) or Cadastral Number (e.g., C001)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter plan description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Gazette Details Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Gazette Details</h3>
            
            {/* Section 07 Gazette */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Section 07 Gazette</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 07 Gazette No
                  </label>
                  <input
                    type="text"
                    name="section_07_gazette_no"
                    value={formData.section_07_gazette_no}
                    onChange={handleInputChange}
                    placeholder="Enter Section 07 gazette number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date (DD/MM/YY)
                  </label>
                  <input
                    type="date"
                    name="section_07_gazette_date"
                    value={formData.section_07_gazette_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 38 Gazette */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Section 38 Gazette</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 38 Gazette No
                  </label>
                  <input
                    type="text"
                    name="section_38_gazette_no"
                    value={formData.section_38_gazette_no}
                    onChange={handleInputChange}
                    placeholder="Enter Section 38 gazette number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date (DD/MM/YY)
                  </label>
                  <input
                    type="date"
                    name="section_38_gazette_date"
                    value={formData.section_38_gazette_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Tracing No
                </label>
                {selectedProjectDetails?.advance_tracing_no ? (
                  <select
                    name="advance_tracing_no"
                    value={formData.advance_tracing_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Advance Tracing No</option>
                    <option value={selectedProjectDetails.advance_tracing_no}>
                      {selectedProjectDetails.advance_tracing_no}
                    </option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name="advance_tracing_no"
                    value={formData.advance_tracing_no}
                    onChange={handleInputChange}
                    placeholder="Enter advance tracing number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
                {!selectedProjectDetails?.advance_tracing_no && formData.project_id && (
                  <p className="text-sm text-gray-500 mt-1">
                    No advance tracing number found in selected project
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section 5 Gazette No
                </label>
                <input
                  type="text"
                  name="section_5_gazette_no"
                  value={formData.section_5_gazette_no}
                  onChange={handleInputChange}
                  placeholder="Enter Section 5 gazette number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisional Secretary
                </label>
                <input
                  type="text"
                  name="divisional_secretary"
                  value={formData.divisional_secretary}
                  onChange={handleInputChange}
                  placeholder="Enter divisional secretary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pending Cost Estimate
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="pending_cost_estimate"
                  value={formData.pending_cost_estimate}
                  onChange={handleInputChange}
                  placeholder="Enter pending cost estimate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleInputChange}
                  placeholder="Enter estimated cost"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Extent
                </label>
                <input
                  type="text"
                  name="estimated_extent"
                  value={formData.estimated_extent}
                  onChange={handleInputChange}
                  placeholder="Enter estimated extent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Extent Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="current_extent_value"
                  value={formData.current_extent_value}
                  onChange={handleInputChange}
                  placeholder="Enter current extent value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={clearForm}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mr-3"
            >
              <X size={20} />
              <span>Clear</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{isEditMode ? 'Update Plan' : 'Create Plan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Selected Project Info */}
      {selectedProject && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Selected Project</h4>
          <p className="text-orange-800"><strong>Name:</strong> {selectedProject.name}</p>
          <p className="text-orange-800"><strong>Description:</strong> {selectedProject.description}</p>
          <p className="text-orange-700 text-sm mt-2">
            ✓ You are assigned to this project and can create plans for it.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatePlan;


