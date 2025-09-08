import { useState, useEffect } from 'react';

const useMessageCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to manually trigger count update
  const refreshCount = () => {
    loadUnreadCount();
  };

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for updates every 30 seconds for real-time updates
    const interval = setInterval(loadUnreadCount, 30000);
    
    // Listen for storage changes (when user reads messages in another tab)
    const handleStorageChange = () => {
      loadUnreadCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    unreadCount,
    loading,
    refreshCount
  };
};

export default useMessageCount;