import { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    projectName: '',
    estimatedCost: '',
    extentHa: '',
    extentPerch: '',
    section02OrderDay: '',
    section02OrderMonth: '',
    section02OrderYear: '',
    section02CompletedDay: '',
    section02CompletedMonth: '',
    section02CompletedYear: '',
    advanceTracingNo: '',
    advanceTracingDay: '',
    advanceTracingMonth: '',
    advanceTracingYear: '',
    section05GazetteNo: '',
    section05GazetteDay: '',
    section05GazetteMonth: '',
    section05GazetteYear: '',
    acquisitionType: 'regulation',
    note: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load project data when component mounts
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/projects/${projectId}`);
        const project = response.data;
        
        // Parse dates if they exist
        const section2Date = project.section_2_order ? new Date(project.section_2_order) : null;
        const section2CompDate = project.section_2_com ? new Date(project.section_2_com) : null;
        const advancingDate = project.advance_tracing_date ? new Date(project.advance_tracing_date) : null;
        const section5Date = project.section_5_no_date ? new Date(project.section_5_no_date) : null;

        setFormData({
          projectName: project.name || '',
          estimatedCost: project.initial_estimated_cost || '',
          extentHa: project.initial_extent_ha || '',
          extentPerch: project.initial_extent_perch || '',
          section02OrderDay: section2Date ? section2Date.getDate().toString() : '',
          section02OrderMonth: section2Date ? (section2Date.getMonth() + 1).toString() : '',
          section02OrderYear: section2Date ? section2Date.getFullYear().toString() : '',
          section02CompletedDay: section2CompDate ? section2CompDate.getDate().toString() : '',
          section02CompletedMonth: section2CompDate ? (section2CompDate.getMonth() + 1).toString() : '',
          section02CompletedYear: section2CompDate ? section2CompDate.getFullYear().toString() : '',
          advanceTracingNo: project.advance_tracing_no || '',
          advanceTracingDay: advancingDate ? advancingDate.getDate().toString() : '',
          advanceTracingMonth: advancingDate ? (advancingDate.getMonth() + 1).toString() : '',
          advanceTracingYear: advancingDate ? advancingDate.getFullYear().toString() : '',
          section05GazetteNo: project.section_5_no || '',
          section05GazetteDay: section5Date ? section5Date.getDate().toString() : '',
          section05GazetteMonth: section5Date ? (section5Date.getMonth() + 1).toString() : '',
          section05GazetteYear: section5Date ? section5Date.getFullYear().toString() : '',
          acquisitionType: project.compensation_type || 'regulation',
          note: project.notes || ''
        });
        
        setError('');
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Area conversion: 1 hectare = 395.37 perches (Sri Lankan standard)
    if (name === 'extentHa' && value !== '') {
      const hectares = parseFloat(value);
      if (!isNaN(hectares)) {
        const perches = (hectares * 395.37).toFixed(2);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          extentPerch: perches
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
    
    if (!formData.projectName || !formData.estimatedCost) {
      alert('Please fill in required fields (Project Name and Estimated Cost)');
      return;
    }

    try {
      // Create date objects from form data
      const section2OrderDate = formData.section02OrderDay && formData.section02OrderMonth && formData.section02OrderYear 
        ? new Date(formData.section02OrderYear, formData.section02OrderMonth - 1, formData.section02OrderDay)
        : null;
        
      const section2CompDate = formData.section02CompletedDay && formData.section02CompletedMonth && formData.section02CompletedYear
        ? new Date(formData.section02CompletedYear, formData.section02CompletedMonth - 1, formData.section02CompletedDay)
        : null;
        
      const advanceTracingDate = formData.advanceTracingDay && formData.advanceTracingMonth && formData.advanceTracingYear
        ? new Date(formData.advanceTracingYear, formData.advanceTracingMonth - 1, formData.advanceTracingDay)
        : null;
        
      const section5Date = formData.section05GazetteDay && formData.section05GazetteMonth && formData.section05GazetteYear
        ? new Date(formData.section05GazetteYear, formData.section05GazetteMonth - 1, formData.section05GazetteDay)
        : null;

      const updateData = {
        name: formData.projectName,
        initial_estimated_cost: parseFloat(formData.estimatedCost),
        initial_extent_ha: parseFloat(formData.extentHa) || 0,
        initial_extent_perch: formData.extentPerch || '',
        section_2_order: section2OrderDate,
        section_2_com: section2CompDate,
        advance_tracing_no: formData.advanceTracingNo || null,
        advance_tracing_date: advanceTracingDate,
        section_5_no: formData.section05GazetteNo || null,
        section_5_no_date: section5Date,
        compensation_type: formData.acquisitionType,
        notes: formData.note || null
      };

      await api.put(`/api/projects/update/${projectId}`, updateData);
      
      alert('Project updated successfully!');
      navigate('/pe-dashboard');
    } catch (error) {
      console.error('Error updating project:', error);
      alert(error.response?.data?.error || 'Failed to update project. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Edit Project
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Update project details and proposal information
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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/pe-dashboard')}
            className="mt-2 text-red-600 underline"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        /* Form */
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Project Information</h2>
              <div className="text-center text-sm text-slate-600">
                Ministry of Highways<br />
                Road Development Authority<br />
                Land Acquisition
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Proposal Details Section */}
              <div className="border border-blue-300 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-700 mb-4">Proposal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Initial Estimated Cost <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., $100 Mn"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Initial Estimated extent (ha)
                    </label>
                    <input
                      type="number"
                      name="extentHa"
                      value={formData.extentHa}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Initial Estimated extent (Perch) 
                      {formData.extentHa && (
                        <span className="text-blue-600 text-xs font-normal ml-1">(Auto-calculated from hectares)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="extentPerch"
                      value={formData.extentPerch}
                      onChange={handleInputChange}
                      className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.extentHa ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Section 02 Order */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Section 02 Order</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="section02OrderDay"
                      value={formData.section02OrderDay}
                      onChange={handleInputChange}
                      placeholder="DD"
                      className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="31"
                    />
                    <input
                      type="number"
                      name="section02OrderMonth"
                      value={formData.section02OrderMonth}
                      onChange={handleInputChange}
                      placeholder="MM"
                      className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="12"
                    />
                    <input
                      type="number"
                      name="section02OrderYear"
                      value={formData.section02OrderYear}
                      onChange={handleInputChange}
                      placeholder="YY"
                      className="w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="23"
                    />
                  </div>
                </div>

                {/* Section 02 Completed */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Section 02 Completed</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="section02CompletedDay"
                      value={formData.section02CompletedDay}
                      onChange={handleInputChange}
                      placeholder="DD"
                      className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="31"
                    />
                    <input
                      type="number"
                      name="section02CompletedMonth"
                      value={formData.section02CompletedMonth}
                      onChange={handleInputChange}
                      placeholder="MM"
                      className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="12"
                    />
                    <input
                      type="number"
                      name="section02CompletedYear"
                      value={formData.section02CompletedYear}
                      onChange={handleInputChange}
                      placeholder="YY"
                      className="w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="23"
                    />
                  </div>
                </div>

                {/* Advance Tracing */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Advance Tracing No</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="advanceTracingNo"
                      value={formData.advanceTracingNo}
                      onChange={handleInputChange}
                      placeholder="Advance Tracing Number"
                      className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="advanceTracingDay"
                        value={formData.advanceTracingDay}
                        onChange={handleInputChange}
                        placeholder="DD"
                        className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="31"
                      />
                      <input
                        type="number"
                        name="advanceTracingMonth"
                        value={formData.advanceTracingMonth}
                        onChange={handleInputChange}
                        placeholder="MM"
                        className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        name="advanceTracingYear"
                        value={formData.advanceTracingYear}
                        onChange={handleInputChange}
                        placeholder="YY"
                        className="w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="23"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 05 Gazette No */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Section 05 Gazette No</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="section05GazetteNo"
                      value={formData.section05GazetteNo}
                      onChange={handleInputChange}
                      placeholder="Gazette Number"
                      className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="section05GazetteDay"
                        value={formData.section05GazetteDay}
                        onChange={handleInputChange}
                        placeholder="DD"
                        className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="31"
                      />
                      <input
                        type="number"
                        name="section05GazetteMonth"
                        value={formData.section05GazetteMonth}
                        onChange={handleInputChange}
                        placeholder="MM"
                        className="w-16 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        name="section05GazetteYear"
                        value={formData.section05GazetteYear}
                        onChange={handleInputChange}
                        placeholder="YY"
                        className="w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="23"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Type of Acquisition */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-700">Type of Acquisition</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="acquisitionType"
                      value="regulation"
                      checked={formData.acquisitionType === 'regulation'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Regulation</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="acquisitionType"
                      value="larc"
                      checked={formData.acquisitionType === 'larc'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Larc / Super larc</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="acquisitionType"
                      value="special"
                      checked={formData.acquisitionType === 'special'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Special Committee Decision</span>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/pe-dashboard')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Update Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default EditProject;
