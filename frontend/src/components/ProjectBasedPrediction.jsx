import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Info,
  FileText,
  Building,
  Calendar,
  Search,
  Eye
} from 'lucide-react';
import api from '../api';

const ProjectBasedPrediction = ({ userRole }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    loadProjects();
    loadModelInfo();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      console.log('🔍 Attempting to load projects...');
      
      // Try different project endpoints
      let response;
      try {
        console.log('📡 Trying /api/projects/user/projects...');
        response = await api.get('/api/projects/user/projects');
        console.log('✅ /api/projects/user/projects response:', response.data);
      } catch (error) {
        console.log('❌ /api/projects/user/projects failed:', error.response?.status);
        if (error.response?.status === 404) {
          // Try fallback endpoint
          console.log('📡 Trying /api/projects...');
          response = await api.get('/api/projects');
          console.log('✅ /api/projects response:', response.data);
        } else {
          throw error;
        }
      }
      
      let projectsData = [];
      if (response.data.success) {
        projectsData = response.data.projects || [];
      } else if (Array.isArray(response.data)) {
        // Handle direct array response
        projectsData = response.data;
      }
      
      console.log('📊 Loaded projects:', projectsData.length);
      if (projectsData.length > 0) {
        console.log('🔍 First project structure:', projectsData[0]);
        console.log('📋 Project fields:', Object.keys(projectsData[0]));
      }
      setProjects(projectsData);
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      setError(`Failed to load projects: ${error.response?.data?.error || error.message}. Please ensure you are logged in with proper permissions.`);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadModelInfo = async () => {
    try {
      const response = await api.get('/api/predictions/model-info');
      if (response.data.success) {
        setModelInfo(response.data.model_info);
      }
    } catch (error) {
      console.error('Failed to load model info:', error);
    }
  };

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setPrediction(null);
    setError(null);
    
    // Auto-predict when project is selected
    await predictProjectCost(project);
  };

  const predictProjectCost = async (project) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get project statistics (plans and lots count) 
      let totalPlans = 0;
      let totalLots = 0;
      let dataSource = 'default';
      
      // For now, let's skip the statistics endpoint and go directly to individual calls
      // since the route seems to have issues and we need to check if there's actual data
      
      try {
        console.log(`📋 Fetching plans for project ${project.id}...`);
        const plansResponse = await api.get(`/api/plans/project/${project.id}`);
        const plansData = plansResponse.data;
        
        console.log(`📋 Plans response for project ${project.id}:`, plansData);
        
        if (plansData.success && plansData.plans && Array.isArray(plansData.plans)) {
          totalPlans = plansData.plans.length;
          dataSource = 'individual_apis';
          console.log(`✅ Found ${totalPlans} plans for project ${project.id}`);
          
          // Get lots count for each plan
          for (const plan of plansData.plans) {
            try {
              console.log(`🔍 Fetching lots for plan ${plan.id}...`);
              const lotsResponse = await api.get(`/api/lots/plan/${plan.id}`);
              console.log(`📦 Lots response for plan ${plan.id}:`, lotsResponse.data);
              
              let planLots = 0;
              if (lotsResponse.data.success && lotsResponse.data.lots && Array.isArray(lotsResponse.data.lots)) {
                // Format: {success: true, lots: [...]}
                planLots = lotsResponse.data.lots.length;
                console.log(`✅ Found ${planLots} lots for plan ${plan.id} (success format)`);
              } else if (Array.isArray(lotsResponse.data)) {
                // Format: direct array [...]
                planLots = lotsResponse.data.length;
                console.log(`✅ Found ${planLots} lots for plan ${plan.id} (direct array format)`);
              } else {
                console.log(`ℹ️ No lots found for plan ${plan.id}. Response:`, lotsResponse.data);
              }
              
              totalLots += planLots;
            } catch (lotError) {
              console.log(`⚠️ Could not get lots for plan ${plan.id}:`, lotError.response?.status, lotError.response?.data);
            }
          }
          console.log(`✅ Total lots found: ${totalLots}`);
        } else if (plansData && Array.isArray(plansData)) {
          // Handle direct array response
          totalPlans = plansData.length;
          dataSource = 'direct_array';
          console.log(`✅ Found ${totalPlans} plans (direct array) for project ${project.id}`);
        } else {
          console.log(`ℹ️ No plans found for project ${project.id}. Response structure:`, plansData);
        }
      } catch (planError) {
        console.log(`⚠️ Could not get plans for project ${project.id}:`, planError.response?.status, planError.response?.data);
        console.log('📊 Continuing with prediction using 0 plans/lots');
      }

      // Prepare prediction data with fallback values
      const predictionData = {
        location: project.name || project.project_name || project.location || 'Unknown',
        district: project.district || extractDistrict(project.name || project.project_name) || 'Unknown',
        initial_estimate_extent_ha: parseFloat(project.initial_extent_ha || project.estimated_extent) || 10, // Default 10 hectares
        initial_estimated_cost: parseFloat(project.initial_estimated_cost || project.estimated_cost) || 50000000, // Default 50M LKR
        no_of_plans: totalPlans,
        no_of_lots: totalLots,
        land_type: project.land_type || determineProjectType(project.name || project.project_name) || 'Agricultural',
        project_stage: project.status || 'Processing',
        year: new Date(project.created_at).getFullYear() || new Date().getFullYear()
      };

      console.log('🔍 Project data:', project);
      console.log('📊 Prediction data:', predictionData);
      console.log('📈 Plans count:', totalPlans, 'Lots count:', totalLots, 'Data source:', dataSource);

      // Call prediction API
      const response = await api.post('/api/predictions/predict', predictionData);
      
      if (response.data.success) {
        setPrediction({
          ...response.data.prediction,
          project_info: {
            name: project.name || project.project_name || `Project #${project.id}`,
            id: project.id,
            plans_count: totalPlans,
            lots_count: totalLots
          }
        });
      } else {
        setError('Prediction failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Prediction error:', error);
      console.error('📋 Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 503) {
        setError('AI Prediction service is currently unavailable. Please ensure the Python API server is running.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Invalid prediction data';
        setError(`Prediction failed: ${errorMsg}. Please check the project data.`);
      } else {
        setError(error.response?.data?.message || 'Failed to get prediction. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractDistrict = (projectName) => {
    const districts = [
      'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 'Kurunegala',
      'Ratnapura', 'Badulla', 'Batticaloa', 'Matara', 'Hambantota', 'Kalutara'
    ];
    
    for (const district of districts) {
      if (projectName?.toLowerCase().includes(district.toLowerCase())) {
        return district;
      }
    }
    return null;
  };

  const determineProjectType = (projectName) => {
    const name = projectName?.toLowerCase() || '';
    if (name.includes('urban') || name.includes('city') || name.includes('town')) return 'Urban';
    if (name.includes('agricultural') || name.includes('farm') || name.includes('paddy')) return 'Agricultural';
    if (name.includes('industrial') || name.includes('factory') || name.includes('zone')) return 'Industrial';
    if (name.includes('residential') || name.includes('housing')) return 'Residential';
    if (name.includes('commercial') || name.includes('business')) return 'Commercial';
    return 'Urban'; // Default
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPredictionPhaseInfo = () => {
    if (!selectedProject) return null;
    
    const hasPlansAndLots = prediction?.project_info?.plans_count > 0 && prediction?.project_info?.lots_count > 0;
    return {
      phase: hasPlansAndLots ? 2 : 1,
      description: hasPlansAndLots ? 'Refined Prediction' : 'Initial Prediction',
      color: hasPlansAndLots ? 'green' : 'yellow'
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calculator size={32} />
          <div>
            <h1 className="text-2xl font-bold">AI Cost Prediction - Project Based</h1>
            <p className="text-blue-100">Select a project to get automatic cost predictions using AI</p>
          </div>
        </div>

        {modelInfo && (
          <div className="bg-blue-500/30 rounded-lg p-3 text-sm">
            <div className="flex items-center space-x-4">
              <span>Model: {modelInfo.model_type}</span>
              <span>Features: {modelInfo.feature_count}</span>
              <span className="flex items-center space-x-1">
                <CheckCircle size={16} />
                <span>Active</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Building size={20} />
            <span>Select Project</span>
          </h2>

          {isLoadingProjects ? (
            <div className="text-center py-8">
              <RefreshCw size={24} className="animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Building size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No projects found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {project.name || project.project_name || `Project #${project.id}` || 'Unnamed Project'}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <span>Extent: {project.initial_extent_ha || project.estimated_extent || project.extent || 'N/A'} ha</span>
                          <span>Status: {project.status || 'Unknown'}</span>
                          <span>Estimated Cost: {project.initial_estimated_cost || project.estimated_cost || project.cost ? formatCurrency(project.initial_estimated_cost || project.estimated_cost || project.cost) : 'N/A'}</span>
                          <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Eye size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Project Info */}
          {selectedProject && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Selected Project Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Project:</strong> {selectedProject.name || selectedProject.project_name || 'Unnamed Project'}</div>
                <div><strong>Extent:</strong> {selectedProject.initial_extent_ha || selectedProject.estimated_extent || 'N/A'} hectares</div>
                <div><strong>Initial Cost:</strong> {selectedProject.initial_estimated_cost || selectedProject.estimated_cost ? formatCurrency(selectedProject.initial_estimated_cost || selectedProject.estimated_cost) : 'N/A'}</div>
                <div><strong>Status:</strong> {selectedProject.status || 'Unknown'}</div>
                <div><strong>Created:</strong> {new Date(selectedProject.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <BarChart3 size={20} />
            <span>AI Prediction Results</span>
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Generating AI prediction...</p>
              <p className="text-xs text-gray-400 mt-2">Analyzing project data and historical patterns</p>
            </div>
          ) : !selectedProject ? (
            <div className="text-center py-12">
              <Calculator size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a project to see AI cost prediction</p>
            </div>
          ) : !prediction ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-500">Prediction not available</p>
              <p className="text-xs text-gray-400 mt-2">Please check if the AI service is running</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prediction Phase */}
              {(() => {
                const phaseInfo = getPredictionPhaseInfo();
                return phaseInfo ? (
                  <div className={`p-3 rounded-lg ${phaseInfo.color === 'green' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-center space-x-2">
                      <Info size={16} className={phaseInfo.color === 'green' ? 'text-green-600' : 'text-yellow-600'} />
                      <span className={`text-sm font-medium ${phaseInfo.color === 'green' ? 'text-green-700' : 'text-yellow-700'}`}>
                        Phase {phaseInfo.phase} - {phaseInfo.description}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${phaseInfo.color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {phaseInfo.phase === 1 
                        ? 'Based on project details only' 
                        : `Based on project details + ${prediction.project_info.plans_count} plans + ${prediction.project_info.lots_count} lots`
                      }
                    </p>
                  </div>
                ) : null;
              })()}

              {/* Main Prediction */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Predicted Full Expense</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(prediction.predicted_full_expense)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{prediction.prediction_phase}</p>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Initial Estimate</span>
                  </div>
                  <div className="text-xl font-semibold text-gray-800">
                    {formatCurrency(prediction.initial_estimated_cost)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={16} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Cost Increase</span>
                  </div>
                  <div className="text-xl font-semibold text-orange-600">
                    {formatCurrency(prediction.cost_increase_amount)}
                  </div>
                  <div className="text-sm text-orange-500">
                    {formatPercentage(prediction.cost_increase_percentage)}
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">Project Analysis</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-600">Project:</span> {prediction.project_info.name}</div>
                  <div><span className="text-gray-600">Plans:</span> {prediction.project_info.plans_count}</div>
                  <div><span className="text-gray-600">Lots:</span> {prediction.project_info.lots_count}</div>
                  <div><span className="text-gray-600">Extent:</span> {prediction.input_features.extent_ha} ha</div>
                </div>
                
                {/* Warning for no plans/lots */}
                {(prediction.project_info.plans_count === 0 || prediction.project_info.lots_count === 0) && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-700">
                    <div className="flex items-center space-x-1">
                      <AlertCircle size={14} />
                      <span className="font-medium">Note:</span>
                    </div>
                    <div className="mt-1">
                      This project has {prediction.project_info.plans_count === 0 ? 'no plans' : `${prediction.project_info.plans_count} plans but no lots`}. 
                      The prediction is based on project details only and may be less accurate.
                      {prediction.project_info.plans_count === 0 && ' Consider adding plans to improve prediction accuracy.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Confidence Interval */}
              {prediction.confidence_interval && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Prediction Confidence Range</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-600">Lower Bound</span>
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(prediction.confidence_interval.lower)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Upper Bound</span>
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(prediction.confidence_interval.upper)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-500 text-center">
                Predicted on {new Date(prediction.prediction_timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      {error && error.includes('unavailable') && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>AI Service Setup Required</span>
          </h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>The AI prediction service is not running. To enable predictions:</p>
            <div className="bg-yellow-100 rounded p-3 mt-3">
              <p className="font-medium mb-2">Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Open terminal and navigate to: <code className="bg-white px-1 rounded">ai_model</code> folder</li>
                <li>Install dependencies: <code className="bg-white px-1 rounded">pip install -r requirements.txt</code></li>
                <li>Train the model: <code className="bg-white px-1 rounded">python train_land_model.py</code></li>
                <li>Start the API server: <code className="bg-white px-1 rounded">python predict_api.py</code></li>
              </ol>
            </div>
            <p className="text-xs mt-2">Contact your system administrator if you need assistance.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBasedPrediction;