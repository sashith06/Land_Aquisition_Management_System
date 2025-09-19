import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PlanProgressChart = ({ data, title = "Plan Progress Overview", filterBy = 'all', projectFilter = 'all' }) => {
  // Filter data based on filterBy and projectFilter props
  const filteredData = data.filter(item => {
    let statusMatch = true;
    let projectMatch = true;

    // Status filter
    if (filterBy === 'completed') statusMatch = item.progress === 100;
    else if (filterBy === 'in_progress') statusMatch = item.progress > 0 && item.progress < 100;
    else if (filterBy === 'not_started') statusMatch = item.progress === 0;
    else if (filterBy !== 'all') statusMatch = item.status === filterBy;

    // Project filter
    if (projectFilter !== 'all') {
      projectMatch = item.project_id.toString() === projectFilter.toString();
    }

    return statusMatch && projectMatch;
  });

  // Prepare chart data
  const chartData = {
    labels: filteredData.map(item => `${item.plan_identifier || `Plan ${item.id}`} (${item.project_name})`),
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

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-gray-500">No plans match the current filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PlanProgressChart;