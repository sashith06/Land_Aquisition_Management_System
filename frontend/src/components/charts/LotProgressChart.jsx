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
  isStepChart = false
}) => {
  // If isStepChart, data is [{label, count}]
  if (isStepChart) {
    // Prepare chart data for steps
    const labels = data.map(d => d.label);
    const counts = data.map(d => d.count);
    const backgroundColors = [
      'rgba(59, 130, 246, 0.8)', // Owner Details - blue
      'rgba(245, 158, 11, 0.8)', // Land Details - orange
      'rgba(168, 85, 247, 0.8)', // Valuation - purple
      'rgba(236, 72, 153, 0.8)', // Compensation - pink
      'rgba(34, 197, 94, 0.8)', // Completed - green
    ];
    const borderColors = [
      'rgba(59, 130, 246, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(168, 85, 247, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(34, 197, 94, 1)',
    ];
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Lots at Step',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
        }
      ]
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed.y || context.parsed} lots`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
          title: { display: true, text: 'Number of Lots' }
        }
      }
    };
    if (counts.reduce((a, b) => a + b, 0) === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500">No lots at any step</p>
          </div>
        </div>
      );
    }
    if (chartType === 'doughnut') {
      return <div className="h-64 w-full"><Doughnut data={chartData} options={options} /></div>;
    }
    return <div className="h-64 w-full"><Bar data={chartData} options={options} /></div>;
  }
  // ...existing code for per-lot progress chart...
};

export default LotProgressChart;