import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Loader,
  FileText,
  BarChart3
} from 'lucide-react';
import api from '../api';

const LandValuation = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/land-valuation/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateValuation = async (projectId, forceRecalculate = false) => {
    try {
      setCalculating(true);
      setError(null);
      
      // Build URL with recalculate parameter if needed
      const url = forceRecalculate 
        ? `/api/land-valuation/projects/${projectId}/calculate?recalculate=true`
        : `/api/land-valuation/projects/${projectId}/calculate`;
      
      const response = await api.post(url);
      
      if (response.data.success) {
        setValuation(response.data.valuation);
        
        // Show message if using stored data
        if (response.data.valuation.stored && !forceRecalculate) {
          console.log('✅ Loaded stored valuation from', response.data.valuation.calculatedAt);
        }
      }
    } catch (err) {
      console.error('Error calculating valuation:', err);
      setError(err.response?.data?.message || 'Failed to calculate valuation. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setError(null);
    
    // Load valuation (will use stored if available, otherwise calculate)
    await calculateValuation(project.id, false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatExtent = (extent) => {
    if (!extent) return 'N/A';
    return extent;
  };

  const getConfidenceBadge = (confidence) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-orange-100 text-orange-800',
      estimated: 'bg-gray-100 text-gray-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[confidence] || colors.unknown}`}>
        {confidence.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-800">Land Valuation Prediction</h1>
        </div>
        <p className="text-gray-600">
          AI-powered land valuation based on location, market trends, and real-time data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Project Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Select Project</h2>
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh projects"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No projects available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{project.total_plans || 0} Plans</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Valuation Results */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!selectedProject && !calculating && !valuation && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Select a Project to Start
              </h3>
              <p className="text-gray-600">
                Choose a project from the left panel to view its land valuation prediction
              </p>
            </div>
          )}

          {calculating && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Loader className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Calculating Valuation...
              </h3>
              <p className="text-gray-600">
                Analyzing land prices and market data. This may take a few moments.
              </p>
            </div>
          )}

          {valuation && !calculating && (
            <div className="space-y-6">
              {/* Stored Data Indicator */}
              {valuation.stored && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Showing saved valuation</span> from {new Date(valuation.calculatedAt).toLocaleDateString()} at {new Date(valuation.calculatedAt).toLocaleTimeString()}
                        {valuation.calculatedBy && <span className="ml-1">by {valuation.calculatedBy}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings - if any */}
              {valuation.warnings && valuation.warnings.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        Data Quality Warning
                      </p>
                      {valuation.warnings.map((warning, index) => (
                        <div key={index} className="mt-2 text-sm text-yellow-700">
                          <p className="font-medium">{warning.message}</p>
                          {warning.plans && warning.plans.length > 0 && (
                            <ul className="mt-2 ml-4 list-disc space-y-1">
                              {warning.plans.map((plan) => (
                                <li key={plan.id}>
                                  Plan {plan.identifier}: {plan.description || 'No description'}
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="mt-2 text-xs">
                            ℹ️ Please update the extent data for these plans to get accurate valuations.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Quality Summary */}
              {valuation.plansWithData !== undefined && valuation.plansTotal && (
                <div className={`p-4 rounded-lg ${valuation.plansWithData === valuation.plansTotal ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    {valuation.plansWithData === valuation.plansTotal ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <p className={`text-sm font-medium ${valuation.plansWithData === valuation.plansTotal ? 'text-green-800' : 'text-yellow-800'}`}>
                      {valuation.plansWithData} of {valuation.plansTotal} plans have complete extent data
                    </p>
                  </div>
                </div>
              )}
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <p className="text-orange-100 text-sm mb-1">Total Estimated Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(valuation.totalValue)}</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Total Extent</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {valuation.totalExtentPerches.toLocaleString()} perches
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-600 text-sm mb-1">Plans Analyzed</p>
                  <p className="text-2xl font-bold text-gray-800">{valuation.plans.length}</p>
                </div>
              </div>

              {/* Location Breakdown */}
              {valuation.locationBreakdown && valuation.locationBreakdown.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Location Price Breakdown
                  </h3>
                  <div className="space-y-3">
                    {valuation.locationBreakdown.map((loc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="font-medium text-gray-800">{loc.location}</p>
                            <p className="text-sm text-gray-600">{loc.plansCount} plan(s)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {formatCurrency(loc.pricePerPerch)}/perch
                          </p>
                          {getConfidenceBadge(loc.confidence)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plans Details Table */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Valuations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Extent</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Price/Perch</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Est. Value</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuation.plans.map((plan, index) => (
                        <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${plan.warning ? 'bg-yellow-50' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800">{plan.plan_identifier}</span>
                              {plan.warning && (
                                <AlertCircle className="w-4 h-4 text-yellow-600" title={plan.warning} />
                              )}
                              {plan.extentSource && plan.extentSource !== 'total_extent' && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded" title={`Using ${plan.extentSource}`}>
                                  ALT
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{plan.divisional_secretary}</td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {plan.extentInPerches > 0 ? (
                              `${plan.extentInPerches.toFixed(2)} perches`
                            ) : (
                              <span className="text-red-600 font-medium">No extent data</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-800">
                            {formatCurrency(plan.pricePerPerch)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-800">
                            {formatCurrency(plan.estimatedValue)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getConfidenceBadge(plan.confidence)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="4" className="py-3 px-4 text-right text-gray-800">
                          Total Project Value:
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600 text-lg">
                          {formatCurrency(valuation.totalValue)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* AI Insights */}
              {valuation.insights && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">AI Insights</h3>
                      <div className="text-blue-800 text-sm whitespace-pre-line">
                        {valuation.insights}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Calculated on: {new Date(valuation.calculatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  * Valuations are estimates based on available market data and AI analysis. 
                  Actual values may vary. Please consult with a professional valuer for official valuations.
                </p>
              </div>

              {/* Recalculate Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => calculateValuation(selectedProject.id, true)}
                  disabled={calculating}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${calculating ? 'animate-spin' : ''}`} />
                  Recalculate Valuation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandValuation;
