import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Loader,
  RefreshCw,
  Download
} from 'lucide-react';
import api from '../api';
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import PlanProgressChart from '../components/charts/PlanProgressChart';
import LotProgressChart from '../components/charts/LotProgressChart';

const ProjectProgress = () => {
  const [chartData, setChartData] = useState({ projects: [], plans: [], lots: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  

  // Chart filter states
  const [chartFilters, setChartFilters] = useState({
    projects: { 
      status: 'all', 
      progressRange: 'all', 
      chartType: 'bar' 
    },
    plans: { 
      projectId: 'all', 
      status: 'all', 
      chartType: 'bar' 
    },
    lots: { 
      projectId: 'all', 
      planId: 'all', 
      status: 'all', 
      chartType: 'bar' 
    }
  });

  // Fetch charts/progress data only
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // Reuse existing endpoint to populate charts-related data
      const response = await api.get(`/api/stats/project-hierarchy`);
      
      if (response.data.success) {
        setChartData(response.data.data.charts || { projects: [], plans: [], lots: [] });
        setLastUpdated(response.data.lastUpdated);
        setError(null);
      } else {
        setError('Failed to fetch project data');
      }
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  // Chart filter handlers
  const handleChartFilterChange = (chartType, key, value) => {
    setChartFilters(prev => ({
      ...prev,
      [chartType]: {
        ...prev[chartType],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading project hierarchy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Progress Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor progress across projects, plans, and lots</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProgressData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

      </div>



      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      {/* Charts Content */}
      <div className="space-y-6">
          {/* Project Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
              <div className="flex items-center gap-3">
                <select
                  value={chartFilters.projects.status || 'all'}
                  onChange={(e) => handleChartFilterChange('projects', 'status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  
                  
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
                <select
                  value={chartFilters.projects.progressRange || 'all'}
                  onChange={(e) => handleChartFilterChange('projects', 'progressRange', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Progress</option>
                  <option value="0-25">0-25%</option>
                  <option value="26-50">26-50%</option>
                  <option value="51-75">51-75%</option>
                  <option value="76-100">76-100%</option>
                </select>
                <select
                  value={chartFilters.projects.chartType || 'bar'}
                  onChange={(e) => handleChartFilterChange('projects', 'chartType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>
            <ProjectProgressChart 
              title="Project Completion Progress"
              height={350}
              filterBy={chartFilters.projects.status}
              progressRange={chartFilters.projects.progressRange}
              chartType={chartFilters.projects.chartType}
            />
          </div>

          {/* Plan Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Plan Progress</h3>
  
            </div>
            <PlanProgressChart 
              height={350}
              projectFilter={chartFilters.plans.projectId}
              filterBy={chartFilters.plans.status}
              chartType={chartFilters.plans.chartType}
            />
          </div>

          {/* Lot Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lot Progress</h3>
              <div className="flex items-center gap-3">
                <select
                  value={chartFilters.lots.projectId}
                  onChange={(e) => handleChartFilterChange('lots', 'projectId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {chartData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={chartFilters.lots.planId}
                  onChange={(e) => handleChartFilterChange('lots', 'planId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Plans</option>
                  {chartData.plans
                    .filter(plan => chartFilters.lots.projectId === 'all' || plan.project_id.toString() === chartFilters.lots.projectId)
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.plan_identifier}</option>
                    ))}
                </select>
                <select
                  value={chartFilters.lots.status || 'all'}
                  onChange={(e) => handleChartFilterChange('lots', 'status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="surveyed">Surveyed</option>
                </select>
                <select
                  value={chartFilters.lots.chartType}
                  onChange={(e) => handleChartFilterChange('lots', 'chartType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
            </div>
            {/* Calculate lots at each progress step with filters */}
            {(() => {
              let lots = chartData.lots || [];
              // Apply project filter
              if (chartFilters.lots.projectId && chartFilters.lots.projectId !== 'all') {
                lots = lots.filter(lot => String(lot.project_id) === String(chartFilters.lots.projectId));
              }
              // Apply plan filter
              if (chartFilters.lots.planId && chartFilters.lots.planId !== 'all') {
                lots = lots.filter(lot => String(lot.plan_id) === String(chartFilters.lots.planId));
              }
              // Apply status filter (for step, not lot.status)
              // If status is not 'all', only include lots at that step
              let statusFilter = chartFilters.lots.status;
              // Map status filter to step
              const statusToStep = {
                'completed': 'Completed',
                'owner_details': 'Owner Details',
                'land_details': 'Land Details',
                'valuation_details': 'Valuation',
                'compensation': 'Compensation',
              };
              // Count steps
              const stepCounts = {
                'Owner Details': 0,
                'Land Details': 0,
                'Valuation': 0,
                'Compensation': 0,
                'Completed': 0
              };
              lots.forEach(lot => {
                let step = 'Owner Details';
                if (lot.overall_percent === 100 || lot.last_completed_section === 'Compensation') {
                  step = 'Completed';
                } else if (lot.last_completed_section === 'Valuation') {
                  step = 'Compensation';
                } else if (lot.last_completed_section === 'Land Details') {
                  step = 'Valuation';
                } else if (lot.last_completed_section === 'Owner Details') {
                  step = 'Land Details';
                }
                // Only count if matches status filter or filter is 'all'
                if (!statusFilter || statusFilter === 'all' || statusToStep[statusFilter] === step) {
                  stepCounts[step]++;
                }
              });
              // Prepare chart data for steps
              const lotStepData = [
                { label: 'Owner Details', count: stepCounts['Owner Details'] },
                { label: 'Land Details', count: stepCounts['Land Details'] },
                { label: 'Valuation', count: stepCounts['Valuation'] },
                { label: 'Compensation', count: stepCounts['Compensation'] },
                { label: 'Completed', count: stepCounts['Completed'] }
              ];
              return (
                <LotProgressChart
                  data={lotStepData}
                  chartType={chartFilters.lots.chartType}
                  title="Lots at Each Progress Step"
                  height={350}
                  isStepChart={true}
                />
              );
            })()}
          </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};
export default ProjectProgress;