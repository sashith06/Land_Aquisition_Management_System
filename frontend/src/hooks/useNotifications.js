import { useState, useEffect } from 'react';
import { getUnreadNotificationsCount, getNotifications } from '../api';

const useNotifications = (pollingInterval = 30000) => { // Poll every 30 seconds
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationsCount();
      const count = response.data?.count || response.count || 0;
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
      setError(err);
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async (limit = 10) => {
    try {
      setLoading(true);
      const response = await getNotifications(limit);
      const notificationData = response.data || response || [];
      setNotifications(notificationData);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    fetchNotifications();

    // Set up polling interval for unread count
    const interval = setInterval(fetchUnreadCount, pollingInterval);

    // Listen for custom events to refresh notifications
    const handleNotificationsUpdate = () => {
      fetchUnreadCount();
      fetchNotifications();
    };

    window.addEventListener('notificationsUpdate', handleNotificationsUpdate);

    // Cleanup interval and event listener on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdate', handleNotificationsUpdate);
    };
  }, [pollingInterval]);

  // Manual refresh functions
  const refreshCount = () => {
    fetchUnreadCount();
  };

  const refreshNotifications = (limit = 10) => {
    fetchNotifications(limit);
  };

  return {
    unreadCount,
    notifications,
    loading,
    error,
    refreshCount,
    refreshNotifications
  };
};

export default useNotifications;
