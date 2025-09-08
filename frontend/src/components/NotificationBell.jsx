import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { getNotifications } from '../api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      if (response.data.success) {
        const notificationData = response.data.notifications || [];
        setNotifications(notificationData);
        
        // Calculate unread count
        const unread = notificationData.filter(notification => !notification.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onRefresh={loadNotifications}
    />
  );
};

export default NotificationBell;