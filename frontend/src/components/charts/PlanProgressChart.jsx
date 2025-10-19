import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PlanProgressChart = ({ 
  title = "Plan Progress Overview", 
  height = 400, 
  projectFilter = 'all', 
  filterBy = 'all', 
  chartType = 'bar' 
}) => {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchPlansForProject(selectedProject);
    } else {
      setData([]);
    }
  }, [selectedProject]);

  // Update selected project when external projectFilter changes
  useEffect(() => {
    if (projectFilter !== 'all' && projectFilter !== selectedProject) {
      setSelectedProject(projectFilter);
    } else if (projectFilter === 'all' && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id.toString());
    }
  }, [projectFilter, projects, selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('PlanProgressChart: Fetching projects...');
      
      const projectsResponse = await api.get('/api/projects/user-projects');
      const allProjects = projectsResponse.data;
      
      // Sort projects by creation date (newest first) - show all statuses
      const activeProjects = allProjects.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      console.log('PlanProgressChart: All projects:', activeProjects.length);
      
      setProjects(activeProjects);
      
      // Auto-select first project if available
      if (activeProjects.length > 0 && !selectedProject) {
        setSelectedProject(activeProjects[0].id.toString());
      }
      
      setError(null);
    } catch (err) {
      console.error('PlanProgressChart: Error fetching projects:', err);
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlansForProject = async (projectId) => {
    try {
      setPlansLoading(true);
      console.log(`PlanProgressChart: Fetching plans for project ${projectId}...`);
      
      const plansResponse = await api.get(`/api/plans/project/${projectId}`);
      const projectPlans = plansResponse.data;
      
      console.log(`PlanProgressChart: Plans for project ${projectId}:`, projectPlans);
      
      // Find project name for display
      const selectedProjectData = projects.find(p => p.id.toString() === projectId.toString());
      const projectName = selectedProjectData?.name || `Project ${projectId}`;
      
      // Add project name to each plan for display
      const plansWithProjectName = projectPlans.map(plan => ({
        ...plan,
        project_name: projectName
      }));
      
      console.log('PlanProgressChart: Plans with project names:', plansWithProjectName);
      
      setData(plansWithProjectName);
      setError(null);
    } catch (err) {
      console.error(`PlanProgressChart: Error fetching plans for project ${projectId}:`, err);
      setError(err.message);
      setData([]);
    } finally {
      setPlansLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-dashed border-red-300" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-red-400 mb-2">❌</div>
            <p className="text-red-600 mb-2">Failed to load data</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchProjects}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Apply status filter to plans
  const filteredData = data.filter(item => {
    if (filterBy !== 'all' && item.status !== filterBy) {
      return false;
    }
    return true;
  });

  console.log('PlanProgressChart: Filtered plans data:', filteredData);

  // Prepare chart data with filtered data
  const chartData = {
    labels: filteredData.map(item => 
      item.plan_identifier || item.plan_no || `Plan ${item.id}`
    ),
    datasets: [
      {
        label: 'Progress (%)',
        data: filteredData.map(item => item.progress),
        backgroundColor: filteredData.map(item => {
          if (item.progress === 100) return 'rgba(34, 197, 94, 0.8)'; // Green for completed
          if (item.progress >= 75) return 'rgba(59, 130, 246, 0.8)'; // Blue for high progress
          if (item.progress >= 50) return 'rgba(245, 158, 11, 0.8)'; // Orange for medium progress
          if (item.progress >= 25) return 'rgba(239, 68, 68, 0.8)'; // Red for low progress
          return 'rgba(156, 163, 175, 0.8)'; // Gray for not started
        }),
        borderColor: filteredData.map(item => {
          if (item.progress === 100) return 'rgba(34, 197, 94, 1)';
          if (item.progress >= 75) return 'rgba(59, 130, 246, 1)';
          if (item.progress >= 50) return 'rgba(245, 158, 11, 1)';
          if (item.progress >= 25) return 'rgba(239, 68, 68, 1)';
          return 'rgba(156, 163, 175, 1)';
        }),
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = filteredData[context.dataIndex];
            return [
              `Progress: ${context.parsed.y}%`,
              `Status: ${item.status}`,
              `Lots: ${item.completed_lots || 0}/${item.total_lots || 0}`,
              `Estimated Cost: LKR ${(item.estimated_cost || 0).toLocaleString()}`,
              `Total Extent: ${item.total_extent || 0} Ha`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Progress (%)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Progress</h3>
      
      {/* Compact Project Selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name || `Project ${project.id}`}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={fetchProjects}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Chart Content */}
      {!selectedProject ? (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-gray-400 mb-2">📋</div>
            <p className="text-gray-500">Select a project to view plan progress</p>
          </div>
        </div>
      ) : plansLoading ? (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading plans...</p>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-gray-400 mb-2">📋</div>
            <p className="text-gray-500">No plans match the current filter</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
          <div 
            style={{ 
              height: `${height}px`,
              overflowX: filteredData.length > 6 ? 'auto' : 'hidden',
              overflowY: 'hidden'
            }}
          >
            <div style={{ 
              minWidth: filteredData.length > 6 ? `${filteredData.length * 80}px` : '100%',
              height: '100%'
            }}>
              {chartType === 'doughnut' ? (
                <Doughnut data={chartData} options={options} />
              ) : chartType === 'line' ? (
                <Line data={chartData} options={options} />
              ) : (
                <Bar data={chartData} options={options} />
              )}
            </div>
          </div>
          
          {/* Progress Legend */}
          <div className="mt-3 flex flex-wrap gap-3 justify-center">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-600">Not Started</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">Low (1-24%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600">Medium (25-74%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">High (75-99%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Complete (100%)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlanProgressChart;