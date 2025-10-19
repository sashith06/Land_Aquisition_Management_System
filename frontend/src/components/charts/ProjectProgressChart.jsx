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

const ProjectProgressChart = ({ 
  title = "Project Progress Overview", 
  height = 400, 
  filterBy = 'all', 
  progressRange = 'all', 
  chartType = 'bar' 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    // Re-filter data when filters change
    if (data.length > 0) {
      console.log('Filters changed:', { filterBy, progressRange, chartType });
    }
  }, [filterBy, progressRange, chartType, data]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/api/projects/user-projects');
      const projects = response.data;
      
      // Sort projects by creation date (newest first)
      const sortedProjects = projects.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      console.log('ProjectProgressChart: Total projects:', projects.length);
      
      setData(sortedProjects);
      setError(null);
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch project data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 rounded-lg border-2 border-dashed border-red-300" style={{ height: `${height}px` }}>
        <div className="text-center">
          <div className="text-red-400 mb-2">❌</div>
          <p className="text-red-600 mb-2">Failed to load project data</p>
          <button 
            onClick={fetchProjectData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Apply filters to data
  const filteredData = data.filter(item => {
    // Status filter
    if (filterBy !== 'all' && item.status !== filterBy) {
      return false;
    }
    
    // Progress range filter
    if (progressRange !== 'all') {
      const progress = item.progress || 0;
      switch (progressRange) {
        case '0-25':
          if (progress < 0 || progress > 25) return false;
          break;
        case '26-50':
          if (progress < 26 || progress > 50) return false;
          break;
        case '51-75':
          if (progress < 51 || progress > 75) return false;
          break;
        case '76-100':
          if (progress < 76 || progress > 100) return false;
          break;
      }
    }
    
    return true;
  });

  // Prepare chart data with filtered data
  const chartData = {
    labels: filteredData.map(item => item.name || `Project ${item.id}`),
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
      mode: 'index',
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
            const item = data[context.dataIndex];
            return [
              `Progress: ${context.parsed.y}%`,
              `Plans: ${item.completed_plans || 0}/${item.total_plans || 0}`,
              `Compensation: LKR ${(item.total_compensation || 0).toLocaleString()}`
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

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300" style={{ height: `${height}px` }}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">No projects match the current filter</p>
        </div>
      </div>
    );
  }

  // Render different chart types
  const renderChart = () => {
    if (chartType === 'doughnut') {
      return <Doughnut data={chartData} options={options} />;
    } else if (chartType === 'line') {
      return <Line data={chartData} options={options} />;
    } else {
      return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div 
        style={{ 
          height: `${height}px`,
          overflowX: filteredData.length > 6 ? 'auto' : 'hidden',
          overflowY: 'hidden'
        }}
      >
        <div style={{ 
          minWidth: filteredData.length > 6 ? `${filteredData.length * 100}px` : '100%',
          height: '100%'
        }}>
          {renderChart()}
        </div>
      </div>
      
      {/* Refresh Button */}
      <div className="mt-4 text-center">
        <button 
          onClick={fetchProjectData}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ProjectProgressChart;