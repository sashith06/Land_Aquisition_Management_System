import { useState, useEffect } from 'react';

const useStatistics = (detailed = false) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    ongoingProjects: 0,
    activeUsers: 0,
    // Additional detailed stats
    totalProjects: 0,
    approvedProjects: 0,
    pendingProjects: 0,
    rejectedProjects: 0,
    totalUsers: 0,
    pendingUsers: 0,
    chiefEngineers: 0,
    projectEngineers: 0,
    financialOfficers: 0,
    landOfficers: 0,
    landowners: 0,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const endpoint = detailed ? '/api/stats/detailed' : '/api/stats/dashboard';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(detailed && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          ...data,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      
      // Fallback to default values if API fails
      const fallbackStats = {
        activeProjects: 20,
        ongoingProjects: 10,
        activeUsers: 300,
        totalProjects: 30,
        approvedProjects: 20,
        pendingProjects: 10,
        rejectedProjects: 0,
        totalUsers: 300,
        pendingUsers: 25,
        chiefEngineers: 5,
        projectEngineers: 15,
        financialOfficers: 10,
        landOfficers: 20,
        landowners: 250,
        loading: false,
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
      
      setStats(prev => ({ ...prev, ...fallbackStats }));
    }
  };

  // Refresh function to manually trigger stats update
  const refreshStats = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes for dashboard stats, 2 minutes for detailed stats
    const refreshInterval = detailed ? 2 * 60 * 1000 : 5 * 60 * 1000;
    const interval = setInterval(fetchStats, refreshInterval);
    
    // Listen for storage changes (when data is updated in other parts of the app)
    const handleStorageChange = () => {
      fetchStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [detailed]);

  return {
    ...stats,
    refreshStats
  };
};

export default useStatistics;
