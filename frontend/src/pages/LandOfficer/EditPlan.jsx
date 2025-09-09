import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { generateBreadcrumbs } = useBreadcrumbs();

  const [formData, setFormData] = useState({
    project_id: '',
    plan_number: '', // Changed from plan_cadastral_no to plan_number
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

  const [originalPlan, setOriginalPlan] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadPlan();
    loadAvailableProjects();
  }, [id]);

  const loadAvailableProjects = async () => {
    try {
      const response = await api.get('/api/plans/assigned/projects');
      setAvailableProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/plans/${id}`);
      const plan = response.data;
      
      setOriginalPlan(plan);
      setFormData({
        project_id: plan.project_id || '',
        plan_number: plan.plan_number || '', // Changed from plan_cadastral_no to plan_number
        description: plan.description || '',
        estimated_cost: plan.estimated_cost || '',
        estimated_extent: plan.estimated_extent || '',
        advance_trading_no: plan.advance_trading_no || '',
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
        navigate(getDashboardPath());
      } else if (error.response?.status === 404) {
        alert('Plan not found');
        navigate(getDashboardPath());
      } else {
        alert('Error loading plan details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getDashboardPath = () => {
    // Determine the correct dashboard path based on current location
    const currentPath = window.location.pathname;
    return currentPath.includes('/lo-dashboard') ? '/lo-dashboard' : '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

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

      const response = await api.put(`/api/plans/${id}`, processedData);
      
      if (response.data) {
        navigate(getDashboardPath(), { 
          state: { 
            message: 'Plan updated successfully!',
            returnToProject: true,
            projectId: formData.project_id
          }
        });
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setSaving(false);
      
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('Plan with this Plan/Cadastral No already exists')) {
          setErrors({ 
            plan_number: 'This Plan/Cadastral No already exists in this project'
          });
        } else if (error.response.status === 403) {
          alert('You do not have permission to edit this plan');
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('An error occurred while updating the plan');
      }
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      await api.delete(`/api/plans/${id}`);
      navigate(getDashboardPath(), { 
        state: { 
          message: 'Plan deleted successfully!',
          returnToProject: true,
          projectId: formData.project_id
        }
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      setDeleting(false);
      setShowDeleteConfirm(false);
      
      if (error.response?.data?.error) {
        if (error.response.status === 403) {
          alert('You do not have permission to delete this plan');
        } else {
          alert(error.response.data.error);
        }
      } else {
        alert('An error occurred while deleting the plan');
      }
    }
  };

  const handleCancel = () => {
    navigate(getDashboardPath(), {
      state: {
        returnToProject: true,
        projectId: formData.project_id
      }
    });
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Breadcrumb items={generateBreadcrumbs({ planName: originalPlan?.plan_number })} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Plan: {originalPlan?.plan_number}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project *
                </label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a project...</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan/Cadastral No *
                </label>
                <input
                  type="text"
                  name="plan_number"
                  value={formData.plan_number}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.plan_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.plan_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.plan_number}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan description..."
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost (LKR)
                </label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pending Cost Estimate (LKR)
                </label>
                <input
                  type="number"
                  name="pending_cost_estimate"
                  value={formData.pending_cost_estimate}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Land Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Extent
                </label>
                <input
                  type="text"
                  name="estimated_extent"
                  value={formData.estimated_extent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Extent Value (LKR)
                </label>
                <input
                  type="number"
                  name="current_extent_value"
                  value={formData.current_extent_value}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Trading No
                </label>
                <input
                  type="text"
                  name="advance_trading_no"
                  value={formData.advance_trading_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Gazette Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Gazette Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 07 Gazette No
                  </label>
                  <input
                    type="text"
                    name="section_07_gazette_no"
                    value={formData.section_07_gazette_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 07 Gazette Date
                  </label>
                  <input
                    type="date"
                    name="section_07_gazette_date"
                    value={formData.section_07_gazette_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 38 Gazette No
                  </label>
                  <input
                    type="text"
                    name="section_38_gazette_no"
                    value={formData.section_38_gazette_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section 38 Gazette Date
                  </label>
                  <input
                    type="date"
                    name="section_38_gazette_date"
                    value={formData.section_38_gazette_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft size={16} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Update Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPlan;