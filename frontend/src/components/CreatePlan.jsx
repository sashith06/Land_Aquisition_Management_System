import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../api';

const CreatePlan = ({ isOpen, onClose, onSuccess, selectedProject = null }) => {
  const [formData, setFormData] = useState({
    project_id: selectedProject?.id || '',
    plan_no: '',
    cadastral_no: '',
    description: '',
    estimated_cost: '',
    estimated_extent: '',
    advance_trading_no: '',
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load assigned projects when component mounts
  useEffect(() => {
    if (isOpen) {
      loadAssignedProjects();
      if (selectedProject) {
        setFormData(prev => ({ ...prev, project_id: selectedProject.id }));
      }
    }
  }, [isOpen, selectedProject]);

  const loadAssignedProjects = async () => {
    try {
      const response = await api.get('/api/plans/assigned/projects');
      setAssignedProjects(response.data);
    } catch (error) {
      console.error('Error loading assigned projects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.plan_no.trim()) newErrors.plan_no = 'Plan No is required';
    if (!formData.cadastral_no.trim()) newErrors.cadastral_no = 'Cadastral No is required';
    
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
      // Convert empty strings to null for optional fields
      const processedData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          processedData[key] = null;
        } else {
          processedData[key] = formData[key];
        }
      });

      const response = await api.post('/api/plans/create', processedData);
      
      if (response.data) {
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Plan with this Plan No and Cadastral No already exists')) {
          setErrors({ 
            plan_no: 'This combination of Plan No and Cadastral No already exists',
            cadastral_no: 'This combination of Plan No and Cadastral No already exists'
          });
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('Error creating plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      project_id: selectedProject?.id || '',
      plan_no: '',
      cadastral_no: '',
      description: '',
      estimated_cost: '',
      estimated_extent: '',
      advance_trading_no: '',
      divisional_secretary: '',
      current_extent_value: '',
      section_07_gazette_no: '',
      section_07_gazette_date: '',
      section_38_gazette_no: '',
      section_38_gazette_date: '',
      section_5_gazette_no: '',
      pending_cost_estimate: ''
    });
    setErrors({});
    onClose();
  };

  const clearForm = () => {
    setFormData(prev => ({
      ...prev,
      plan_no: '',
      cadastral_no: '',
      description: '',
      estimated_cost: '',
      estimated_extent: '',
      advance_trading_no: '',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create Plan</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan No / Cadastral No Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📄 Plan No / Cadastral No Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    disabled={selectedProject}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="plan_no"
                    value={formData.plan_no}
                    onChange={handleInputChange}
                    placeholder="Enter plan number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.plan_no ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.plan_no && <p className="text-red-500 text-sm mt-1">{errors.plan_no}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cadastral No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cadastral_no"
                    value={formData.cadastral_no}
                    onChange={handleInputChange}
                    placeholder="Enter cadastral number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.cadastral_no ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cadastral_no && <p className="text-red-500 text-sm mt-1">{errors.cadastral_no}</p>}
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

            {/* Gazette Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Gazette Details</h3>
              
              {/* Section 07 Gazette */}
              <div className="mb-4">
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
              <div className="mb-4">
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

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Trading No
                  </label>
                  <input
                    type="text"
                    name="advance_trading_no"
                    value={formData.advance_trading_no}
                    onChange={handleInputChange}
                    placeholder="Enter advance trading number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
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
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={clearForm}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>🧾 Create Plan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
