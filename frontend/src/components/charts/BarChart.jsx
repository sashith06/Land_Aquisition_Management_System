import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  title = 'Bar Chart', 
  height = 400,
  showLegend = true,
  backgroundColor = 'rgba(34, 197, 94, 0.8)',
  borderColor = 'rgba(34, 197, 94, 1)',
  hoverBackgroundColor = 'rgba(34, 197, 94, 0.9)',
  horizontal = false,
  indexAxis = null
}) => {
  const Chart = Bar;
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: indexAxis || (horizontal ? 'y' : 'x'),
    plugins: {
      legend: {
        position: 'top',
        display: showLegend,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
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
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 10,
        },
        beginAtZero: true,
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
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
      hoverBackgroundColor: dataset.hoverBackgroundColor || hoverBackgroundColor,
      borderWidth: 1,
      borderRadius: dataset.borderRadius || 4,
      borderSkipped: false,
    })) || [],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div style={{ height: `${height}px` }}>
        <Chart data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart;