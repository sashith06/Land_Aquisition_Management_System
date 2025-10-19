import { useState, useEffect } from 'react';
import { getUnreadNotificationsCount, getNotifications, getUnreadInquiriesCount, getRecentInquiries } from '../api';
import { getCurrentUser } from '../utils/userUtils';

const useNotifications = (pollingInterval = 30000) => { // Poll every 30 seconds
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getCurrentUser();
  const isOfficer = currentUser?.role === 'land_officer' || 
                   currentUser?.role === 'project_engineer' || 
                   currentUser?.role === 'chief_engineer' || 
                   currentUser?.role === 'financial_officer';
  const isLandowner = currentUser?.role === 'landowner';

  const fetchUnreadCount = async () => {
    try {
      let totalCount = 0;

      // Fetch regular notifications count
      const notificationsResponse = await getUnreadNotificationsCount();
      const notificationsCount = notificationsResponse.data?.count || notificationsResponse.count || 0;
      totalCount += notificationsCount;

      // Fetch unread inquiries count for officers only (not landowners)
      if (isOfficer && !isLandowner) {
        const inquiriesResponse = await getUnreadInquiriesCount();
        const inquiriesCount = inquiriesResponse.data?.count || inquiriesResponse.count || 0;
        totalCount += inquiriesCount;
      }

      setUnreadCount(totalCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
      setError(err);
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async (limit = 10) => {
    try {
      setLoading(true);
      
      // Fetch regular notifications
      const notificationsResponse = await getNotifications(limit);
      let allNotifications = notificationsResponse.data || notificationsResponse || [];
      
      // Fetch recent inquiries for officers only (not landowners)
      if (isOfficer && !isLandowner) {
        try {
          const inquiriesResponse = await getRecentInquiries(limit * 2); // Fetch more to combine properly
          const inquiries = inquiriesResponse.data || inquiriesResponse || [];
          
          // Combine and sort by created_at (most recent first)
          allNotifications = [...allNotifications, ...inquiries].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          
          // Limit to the requested number
          allNotifications = allNotifications.slice(0, limit);
        } catch (inquiryErr) {
          console.error('Error fetching inquiries:', inquiryErr);
          // Continue without inquiries
        }
      }
      
      setNotifications(allNotifications);
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
