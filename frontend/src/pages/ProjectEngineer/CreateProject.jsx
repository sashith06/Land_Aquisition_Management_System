import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sampleCreatedProjects, projectsData, plansData } from '../../data/mockData';

const CreateProject = ({ onProjectCreate }) => {
  const navigate = useNavigate();
  const [createdProjects, setCreatedProjects] = useState(sampleCreatedProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Load created projects from localStorage on component mount
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('createdProjects') || '[]');
    setCreatedProjects([...sampleCreatedProjects, ...savedProjects]);
  }, []);

  // Get plans for selected project
  const filteredPlans = selectedProject ? plansData.filter(plan => plan.projectId === selectedProject.id) : [];
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
      // Save to localStorage for now (you can replace with API call)
      const existingProjects = JSON.parse(localStorage.getItem('createdProjects') || '[]');
      const newProject = {
        ...formData,
        id: Date.now(),
        createdDate: new Date().toISOString().split('T')[0]
      };
      existingProjects.push(newProject);
      localStorage.setItem('createdProjects', JSON.stringify(existingProjects));
      
      // Call parent callback if provided
      if (onProjectCreate) {
        onProjectCreate(formData);
      }
      
      // Reset form
      setFormData({
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
      
      alert('Project created successfully!');
      // Update the local state to show the new project immediately
      const updatedProjects = JSON.parse(localStorage.getItem('createdProjects') || '[]');
      setCreatedProjects([...sampleCreatedProjects, ...updatedProjects]);
      // Navigate back to dashboard
      navigate('/pe-dashboard');
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Create Project Form */}
        <div className="lg:col-span-2">
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
                max="99"
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
                max="99"
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
                  max="99"
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
                  max="99"
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
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
            onClick={() => {
              const confirmed = window.confirm('Are you sure you want to clear the form?');
              if (confirmed) {
                setFormData({
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
              }
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      </form>
          </div>
        </div>

        {/* Right Column - My Created Projects */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {!selectedProject ? 'My Created Projects' : 'Project Plans'}
              </h3>
              {selectedProject && (
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setSelectedPlan(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to Projects
                </button>
              )}
            </div>
            
            {!selectedProject ? (
              // Show Projects List
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projectsData.map((project) => (
                  <div 
                    key={project.id} 
                    className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-slate-900">{project.name}</div>
                        <div className="text-xs text-slate-600">{project.description}</div>
                        <div className="text-xs text-slate-500">Created: {project.createdDate}</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show Plans for Selected Project
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                  <div className="font-medium text-sm text-blue-900">{selectedProject.name}</div>
                  <div className="text-xs text-blue-600">{selectedProject.description}</div>
                </div>
                
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlan?.id === plan.id 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="font-medium text-sm text-slate-900">Plan #{plan.id}</div>
                      <div className="text-xs text-slate-600">Cost: {plan.estimatedCost}</div>
                      <div className="text-xs text-slate-600">Extent: {plan.estimatedExtent}</div>
                      <div className="text-xs text-slate-600">Progress: {plan.progress}%</div>
                      <div className="text-xs text-slate-500">Date: {plan.projectDate}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No plans found for this project</p>
                )}
              </div>
            )}
            
            {/* Selected Plan Details */}
            {selectedPlan && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-sm text-orange-900 mb-2">Selected Plan Details</h4>
                <div className="space-y-1 text-xs">
                  <div><strong>Plan ID:</strong> {selectedPlan.id}</div>
                  <div><strong>Cost:</strong> {selectedPlan.estimatedCost}</div>
                  <div><strong>Extent:</strong> {selectedPlan.estimatedExtent}</div>
                  <div><strong>Progress:</strong> {selectedPlan.progress}%</div>
                  <div><strong>Date:</strong> {selectedPlan.projectDate}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
