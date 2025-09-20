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

const ProjectProgressChart = ({ data, title = "Project Progress Overview", filterBy = 'all' }) => {
  // Filter data based on filterBy prop
  const filteredData = data.filter(item => {
    if (filterBy === 'all') return true;
    if (filterBy === 'completed') return item.progress === 100;
    if (filterBy === 'in_progress') return item.progress > 0 && item.progress < 100;
    if (filterBy === 'not_started') return item.progress === 0;
    return item.status === filterBy;
  });

  // Prepare chart data
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
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">No projects match the current filter</p>
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

export default ProjectProgressChart;