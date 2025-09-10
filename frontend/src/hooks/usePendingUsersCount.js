import { useState, useEffect } from 'react';
import { getPendingUsersCount } from '../api';

const usePendingUsersCount = (pollingInterval = 30000) => { // Poll every 30 seconds
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCount = async () => {
    try {
      setLoading(true);
      const response = await getPendingUsersCount();
      const countValue = response.data?.count || response.count || 0;
      setCount(countValue);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending users count:', err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Insufficient permissions.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch pending users count');
      }
      
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // Set up polling interval
    const interval = setInterval(fetchCount, pollingInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [pollingInterval]);

  // Manual refresh function
  const refresh = () => {
    fetchCount();
  };

  return { count, loading, error, refresh };
};

export default usePendingUsersCount;
