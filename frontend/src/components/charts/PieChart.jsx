import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ 
  data, 
  title = 'Pie Chart', 
  height = 400,
  showLegend = true,
  legendPosition = 'top',
  backgroundColor = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(147, 51, 234, 0.8)',
    'rgba(236, 72, 153, 0.8)',
  ],
  borderColor = [
    'rgba(59, 130, 246, 1)',
    'rgba(34, 197, 94, 1)',
    'rgba(251, 191, 36, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(147, 51, 234, 1)',
    'rgba(236, 72, 153, 1)',
  ]
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: legendPosition,
        display: showLegend,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: isNaN(dataset.data[i]) || meta.data[i].hidden,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets?.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.data || [],
      backgroundColor: dataset.backgroundColor || backgroundColor,
      borderColor: dataset.borderColor || borderColor,
      borderWidth: dataset.borderWidth || 2,
      hoverOffset: 4,
    })) || [],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div style={{ height: `${height}px` }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart;