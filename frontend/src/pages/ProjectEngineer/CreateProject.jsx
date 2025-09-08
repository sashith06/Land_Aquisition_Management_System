import { useState } from 'react';
import { Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    initial_estimated_cost: '',
    initial_extent_ha: '',
    initial_extent_perch: '',
    section_2_order: '',
    section_2_com: '',
    advance_tracing_no: '',
    advance_tracing_date: '',
    section_5_no: '',
    section_5_no_date: '',
    compensation_type: 'regulation',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Area conversion: 1 hectare = 395.37 perches (Sri Lankan standard)
    if (name === 'initial_extent_ha' && value !== '') {
      const hectares = parseFloat(value);
      if (!isNaN(hectares)) {
        const perches = (hectares * 395.37).toFixed(2);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          initial_extent_perch: perches
        }));
        return;
      }
    }
    
    // Regular input handling
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/projects/create', formData);
      
      // Reset form
      setFormData({
        name: '',
        initial_estimated_cost: '',
        initial_extent_ha: '',
        initial_extent_perch: '',
        section_2_order: '',
        section_2_com: '',
        advance_tracing_no: '',
        advance_tracing_date: '',
        section_5_no: '',
        section_5_no_date: '',
        compensation_type: 'regulation',
        notes: ''
      });
      
      alert('Project submitted successfully! It has been sent to the Chief Engineer for approval.');
      navigate('/pe-dashboard');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    const confirmed = window.confirm('Are you sure you want to clear the form?');
    if (confirmed) {
      setFormData({
        name: '',
        initial_estimated_cost: '',
        initial_extent_ha: '',
        initial_extent_perch: '',
        section_2_order: '',
        section_2_com: '',
        advance_tracing_no: '',
        advance_tracing_date: '',
        section_5_no: '',
        section_5_no_date: '',
        compensation_type: 'regulation',
        notes: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Create New Project
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Fill in the project details and proposal information
          </p>
        </div>
        <button
          onClick={() => navigate('/pe-dashboard')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertCircle className="flex-shrink-0 mr-2 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Create Project Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Project Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Project Details */}
          <div className="border border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700 mb-4">Basic Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Estimated Cost
                </label>
                <input
                  type="number"
                  name="initial_estimated_cost"
                  value={formData.initial_estimated_cost}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter cost in USD"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Compensation Type
                </label>
                <select
                  name="compensation_type"
                  value={formData.compensation_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="regulation">Regulation</option>
                  <option value="larc">LARC / Super LARC</option>
                  <option value="special_committee">Special Committee Decision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Estimated Extent (ha)
                </label>
                <input
                  type="number"
                  name="initial_extent_ha"
                  value={formData.initial_extent_ha}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  placeholder="Hectares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Estimated Extent (Perch)
                  <span className="text-xs text-gray-500 ml-1">(Auto-calculated from hectares)</span>
                </label>
                <input
                  type="number"
                  name="initial_extent_perch"
                  value={formData.initial_extent_perch}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  step="0.01"
                  placeholder="Perches (calculated automatically)"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Conversion: 1 hectare = 395.37 perches
                </p>
              </div>
            </div>
          </div>

          {/* Legal Documentation */}
          <div className="border border-green-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700 mb-4">Legal Documentation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section 2 Order
                </label>
                <input
                  type="text"
                  name="section_2_order"
                  value={formData.section_2_order}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Section 2 order details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section 2 Completion
                </label>
                <input
                  type="text"
                  name="section_2_com"
                  value={formData.section_2_com}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Section 2 completion details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Advance Tracing No
                </label>
                <input
                  type="text"
                  name="advance_tracing_no"
                  value={formData.advance_tracing_no}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Advance tracing number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Advance Tracing Date
                </label>
                <input
                  type="date"
                  name="advance_tracing_date"
                  value={formData.advance_tracing_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section 5 No
                </label>
                <input
                  type="text"
                  name="section_5_no"
                  value={formData.section_5_no}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Section 5 number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section 5 Date
                </label>
                <input
                  type="date"
                  name="section_5_no_date"
                  value={formData.section_5_no_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or comments about the project..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={clearForm}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
