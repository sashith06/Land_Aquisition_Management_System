import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const LotProgressChart = ({ 
  data, 
  title = "Lot Progress Overview", 
  chartType = 'bar', 
  filterBy = 'all', 
  projectFilter = 'all',
  planFilter = 'all' 
}) => {
  // Filter data based on all filter props
  const filteredData = data.filter(item => {
    let statusMatch = true;
    let projectMatch = true;
    let planMatch = true;

    // Status filter
    if (filterBy === 'completed') statusMatch = item.progress === 100;
    else if (filterBy === 'in_progress') statusMatch = item.progress === 50;
    else if (filterBy === 'approved') statusMatch = item.progress === 25;
    else if (filterBy === 'not_started') statusMatch = item.progress === 0;
    else if (filterBy !== 'all') statusMatch = item.status === filterBy;

    // Project filter
    if (projectFilter !== 'all') {
      projectMatch = item.project_id.toString() === projectFilter.toString();
    }

    // Plan filter
    if (planFilter !== 'all') {
      planMatch = item.plan_id.toString() === planFilter.toString();
    }

    return statusMatch && projectMatch && planMatch;
  });

  // For doughnut chart, group by status
  if (chartType === 'doughnut') {
    const statusCounts = filteredData.reduce((acc, item) => {
      const status = item.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const doughnutData = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Lot Status Distribution',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green for completed
            'rgba(59, 130, 246, 0.8)',  // Blue for in_progress
            'rgba(245, 158, 11, 0.8)',  // Orange for approved
            'rgba(239, 68, 68, 0.8)',   // Red for pending
            'rgba(156, 163, 175, 0.8)',  // Gray for others
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(156, 163, 175, 1)',
          ],
          borderWidth: 2,
        }
      ]
    };

    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
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
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed * 100) / total).toFixed(1);
              return `${context.label}: ${context.parsed} lots (${percentage}%)`;
            }
          }
        }
      }
    };

    if (filteredData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-gray-400 mb-2">🥧</div>
            <p className="text-gray-500">No lots match the current filter</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 w-full">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    );
  }

  // Bar chart data
  const chartData = {
    labels: filteredData.map(item => 
      `Lot ${item.lot_no} (${item.plan_identifier})`
    ),
    datasets: [
      {
        label: 'Progress (%)',
        data: filteredData.map(item => item.progress),
        backgroundColor: filteredData.map(item => {
          if (item.progress === 100) return 'rgba(34, 197, 94, 0.8)'; // Green for completed
          if (item.progress === 50) return 'rgba(59, 130, 246, 0.8)'; // Blue for in_progress
          if (item.progress === 25) return 'rgba(245, 158, 11, 0.8)'; // Orange for approved
          return 'rgba(156, 163, 175, 0.8)'; // Gray for not started
        }),
        borderColor: filteredData.map(item => {
          if (item.progress === 100) return 'rgba(34, 197, 94, 1)';
          if (item.progress === 50) return 'rgba(59, 130, 246, 1)';
          if (item.progress === 25) return 'rgba(245, 158, 11, 1)';
          return 'rgba(156, 163, 175, 1)';
        }),
        borderWidth: 1,
      }
    ]
  };

  const barOptions = {
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
              `Extent: ${item.extent_ha}Ha ${item.extent_perch}P`,
              `Land Type: ${item.land_type}`,
              `Project: ${item.project_name}`
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
          <p className="text-gray-500">No lots match the current filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={barOptions} />
    </div>
  );
};

export default LotProgressChart;