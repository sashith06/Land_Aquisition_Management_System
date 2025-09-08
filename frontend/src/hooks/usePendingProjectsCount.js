import { useState, useEffect } from 'react';
import api from '../api';

const usePendingProjectsCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      const response = await api.get('/api/projects/pending');
      setCount(response.data.length);
    } catch (error) {
      console.error('Error fetching pending projects count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { count, loading, refetch: fetchCount };
};

export default usePendingProjectsCount;
