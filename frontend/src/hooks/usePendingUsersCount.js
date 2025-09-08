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
      setError(err);
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
