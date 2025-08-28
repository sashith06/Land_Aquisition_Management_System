import { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

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

  // Load project data when component mounts
  useEffect(() => {
    const loadProject = () => {
      // Get projects from localStorage
      const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      const project = savedProjects.find(p => p.id === projectId);
      
      if (project) {
        setFormData({
          projectName: project.projectName || project.name || '',
          estimatedCost: project.estimatedCost || '',
          extentHa: project.extentHa || '',
          extentPerch: project.extentPerch || '',
          section02OrderDay: project.section02OrderDay || '',
          section02OrderMonth: project.section02OrderMonth || '',
          section02OrderYear: project.section02OrderYear || '',
          section02CompletedDay: project.section02CompletedDay || '',
          section02CompletedMonth: project.section02CompletedMonth || '',
          section02CompletedYear: project.section02CompletedYear || '',
          advanceTracingNo: project.advanceTracingNo || '',
          advanceTracingDay: project.advanceTracingDay || '',
          advanceTracingMonth: project.advanceTracingMonth || '',
          advanceTracingYear: project.advanceTracingYear || '',
          section05GazetteNo: project.section05GazetteNo || '',
          section05GazetteDay: project.section05GazetteDay || '',
          section05GazetteMonth: project.section05GazetteMonth || '',
          section05GazetteYear: project.section05GazetteYear || '',
          acquisitionType: project.acquisitionType || 'regulation',
          note: project.note || ''
        });
      } else {
        alert('Project not found!');
        navigate('/pe-dashboard');
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectName && formData.estimatedCost) {
      // Update project in localStorage
      const savedProjects = JSON.parse(localStorage.getItem('projectsData') || '[]');
      const projectIndex = savedProjects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        // Update the project while preserving original structure
        const updatedProject = {
          ...savedProjects[projectIndex],
          ...formData,
          name: formData.projectName, // Ensure name is updated for display
          lastModified: new Date().toISOString()
        };
        
        savedProjects[projectIndex] = updatedProject;
        localStorage.setItem('projectsData', JSON.stringify(savedProjects));
        
        alert('Project updated successfully!');
        navigate('/pe-dashboard');
      } else {
        alert('Error updating project. Project not found.');
      }
    } else {
      alert('Please fill in required fields (Project Name and Estimated Cost)');
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

      {/* Form */}
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
                    </label>
                    <input
                      type="number"
                      name="extentPerch"
                      value={formData.extentPerch}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
};

export default EditProject;
