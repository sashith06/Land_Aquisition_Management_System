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
import TestLotProgress from '../components/TestLotProgress';

const ProjectProgress = () => {
  const [chartData, setChartData] = useState({ projects: [], plans: [], lots: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  

  // Chart filter states
  const [chartFilters, setChartFilters] = useState({
    projects: { 
      status: 'approved', 
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

  // Real-time stage participation data from database tables
  const [stageParticipationData, setStageParticipationData] = useState({
    'Owner Details': 0,
    'Land Details': 0, 
    'Valuation': 0,
    'Compensation': 0,
    'Completed': 0
  });

  // Fetch charts/progress data with real progress calculation
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // Get project hierarchy data with cache busting
      const cacheBuster = Date.now();
      const response = await api.get(`/api/stats/project-hierarchy?_t=${cacheBuster}`);
      
      if (response.data.success) {
        const hierarchyData = response.data.data;
        
        // Process lots data - use the lots from charts which should have better progress data
        let lotsWithProgress = hierarchyData.charts?.lots || [];
        
        // If charts don't have lots data, process from projects hierarchy
        if (lotsWithProgress.length === 0) {
          for (const project of hierarchyData.projects || []) {
            for (const plan of project.plans || []) {
              for (const lot of plan.lots || []) {
                lotsWithProgress.push({
                  id: lot.id,
                  plan_id: plan.id,
                  project_id: project.id,
                  project_name: project.name,
                  plan_identifier: plan.plan_identifier,
                  lot_no: lot.lot_no,
                  status: lot.status,
                  extent_ha: lot.extent_ha || 0,
                  extent_perch: lot.extent_perch || 0,
                  land_type: lot.land_type,
                  overall_percent: lot.progress || 0,
                  last_completed_section: null,
                  sections: []
                });
              }
            }
          }
        }
        
        setChartData({
          projects: hierarchyData.charts?.projects || [],
          plans: hierarchyData.charts?.plans || [],
          lots: lotsWithProgress
        });
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

  // Fetch real-time stage participation data from database tables
  useEffect(() => {
    const fetchStageParticipation = async () => {
      try {
        const projectFilter = chartFilters.lots.projectId !== 'all' ? chartFilters.lots.projectId : null;
        const planFilter = chartFilters.lots.planId !== 'all' ? chartFilters.lots.planId : null;
        
        const params = new URLSearchParams();
        if (projectFilter) params.append('project_id', projectFilter);
        if (planFilter) params.append('plan_id', planFilter);
        
        const response = await fetch(`http://localhost:5000/api/stats/stage-participation?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const data = result.data; // Extract the actual data from the API response
          console.log('=== REAL-TIME DATABASE TABLE COUNTS ===');
          console.log('Full API response:', result);
          console.log('Stage participation data from API:', data);
          console.log('- Owner Details (from owners table):', data['Owner Details']);
          console.log('- Land Details (from lots table):', data['Land Details']);
          console.log('- Valuation (from lot_valuations table):', data['Valuation']);
          console.log('- Compensation (from compensation_payment_details table):', data['Compensation']);
          console.log('- Completed (progress >= 100%):', data['Completed']);
          console.log('=== END REAL-TIME DATA ===');
          setStageParticipationData(data);
        }
      } catch (error) {
        console.error('Error fetching stage participation:', error);
        // Set default values if request fails
        setStageParticipationData({
          'Owner Details': 0,
          'Land Details': 0,
          'Valuation': 0,
          'Compensation': 0,
          'Completed': 0
        });
      }
    };
    
    fetchStageParticipation();
  }, [chartFilters.lots.projectId, chartFilters.lots.planId]);

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
                  
                  <option value="completed">Completed</option>
                 
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
                  <option value="all">All Status</option>
                  <option value="owner_details">Owner Details</option>
                  <option value="land_details">Land Details</option>
                  <option value="valuation">Valuation</option>
                  <option value="compensation">Compensation</option>
                  <option value="completed">Completed</option>
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
            {/* Real-time Lot Progress using actual database table counts */}
            {(() => {
              const statusFilter = chartFilters.lots.status;

              // Use the real-time stage participation data from the component state
              // This data comes from actual database table counts
              let stepCounts = { ...stageParticipationData };
              
              // Apply status filter to show only specific category if selected
              if (statusFilter && statusFilter !== 'all') {
                const filteredCounts = {
                  'Owner Details': 0,
                  'Land Details': 0, 
                  'Valuation': 0,
                  'Compensation': 0,
                  'Completed': 0
                };
                
                if (statusFilter === 'owner_details') {
                  filteredCounts['Owner Details'] = stepCounts['Owner Details'];
                } else if (statusFilter === 'land_details') {
                  filteredCounts['Land Details'] = stepCounts['Land Details'];
                } else if (statusFilter === 'valuation') {
                  filteredCounts['Valuation'] = stepCounts['Valuation'];
                } else if (statusFilter === 'compensation') {
                  filteredCounts['Compensation'] = stepCounts['Compensation'];
                } else if (statusFilter === 'completed') {
                  filteredCounts['Completed'] = stepCounts['Completed'];
                }
                
                stepCounts = filteredCounts;
              }

              // Prepare chart data for steps
              const lotStepData = [
                { label: 'Owner Details', count: stepCounts['Owner Details'] },
                { label: 'Land Details', count: stepCounts['Land Details'] },
                { label: 'Valuation', count: stepCounts['Valuation'] },
                { label: 'Compensation', count: stepCounts['Compensation'] },
                { label: 'Completed', count: stepCounts['Completed'] }
              ];

              // Debug output to console
              console.log('=== CHART DISPLAY DEBUG ===');
              console.log('Current filters - Project:', chartFilters.lots.projectId, 'Plan:', chartFilters.lots.planId, 'Status:', statusFilter);
              console.log('Real-time counts being displayed:');
              console.log('- Owner Details:', stepCounts['Owner Details']);
              console.log('- Land Details:', stepCounts['Land Details']);
              console.log('- Valuation:', stepCounts['Valuation']);
              console.log('- Compensation:', stepCounts['Compensation']);
              console.log('- Completed:', stepCounts['Completed']);
              console.log('Final chart data:', lotStepData);
              console.log('=== END CHART DEBUG ===');

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