import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Custom hook for real-time dashboard data
export const useDashboardData = (updateInterval = 30000) => {
  const [data, setData] = useState({
    stats: {
      totalProjects: 0,
      inProgress: 0,
      completed: 0,
      approved: 0,
      pending: 0,
      totalLandowners: 0,
      totalCompensation: 0,
      avgCompensation: 0,
      totalPayments: 0,
      averageProgress: 0
    },
    chartData: {
      monthlyProgress: { labels: [], datasets: [] },
      projectStatus: { labels: [], datasets: [] },
      locationDistribution: { labels: [], datasets: [] },
      compensationTrend: { labels: [], datasets: [] }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [analyticsResponse, progressResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/stats/analytics`),
        axios.get(`${API_BASE_URL}/stats/progress`)
      ]);

      if (analyticsResponse.data.success) {
        const analyticsData = analyticsResponse.data.data;
        const progressData = progressResponse.data.success ? progressResponse.data.data : null;

        setData({
          stats: analyticsData.stats,
          chartData: {
            ...analyticsData.chartData,
            projectProgress: progressData ? progressData.chartData : { labels: [], datasets: [] }
          }
        });
      }
      
      setLastUpdated(new Date());
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
      
      // Fallback to mock data if API fails
      if (loading) {
        setData(getMockData());
        setLoading(false);
      }
    }
  }, [loading, API_BASE_URL]);

  const getMockData = () => ({
    stats: {
      totalProjects: 25,
      inProgress: 12,
      completed: 8,
      approved: 3,
      pending: 2,
      totalLandowners: 150,
      totalCompensation: 2500000,
      avgCompensation: 16667,
      totalPayments: 150,
      averageProgress: 65
    },
    chartData: {
      monthlyProgress: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Projects Completed',
          data: [2, 3, 5, 4, 6, 7],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)'
        }]
      },
      projectStatus: {
        labels: ['Pending', 'Approved', 'In Progress', 'Completed'],
        datasets: [{
          data: [2, 3, 12, 8],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ]
        }]
      },
      locationDistribution: {
        labels: ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala'],
        datasets: [{
          data: [8, 6, 4, 3, 4],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ]
        }]
      },
      compensationTrend: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            type: 'bar',
            label: 'Monthly Compensation (LKR)',
            data: [250000, 320000, 450000, 380000, 520000, 600000],
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgba(147, 51, 234, 1)',
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Cumulative Compensation',
            data: [250000, 570000, 1020000, 1400000, 1920000, 2520000],
            borderColor: 'rgba(236, 72, 153, 1)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            yAxisID: 'y1'
          }
        ]
      },
      projectProgress: {
        labels: ['Project A', 'Project B', 'Project C', 'Project D', 'Project E'],
        datasets: [{
          label: 'Project Progress (%)',
          data: [85, 92, 76, 63, 89],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.1
        }]
      }
    }
  });

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fetchData, updateInterval]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData
  };
};

// WebSocket hook for real-time updates (optional enhancement)
export const useWebSocketUpdates = (url) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState(null);

  useEffect(() => {
    if (url) {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          setLatestUpdate(update);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket disconnected');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
      
      setSocket(ws);
      
      return () => {
        ws.close();
      };
    }
  }, [url]);

  return {
    socket,
    connected,
    latestUpdate
  };
};