import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { logout } from '../utils/auth';
import { getCurrentUser, getCurrentUserFullName, getUserAvatar, isAdmin, getCurrentUserRole } from '../utils/userUtils';
import Logo from './Logo';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../hooks/useNotifications';

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  // Get current user data from localStorage
  const currentUser = getCurrentUser();
  const userName = getCurrentUserFullName();
  const userAvatar = getUserAvatar();
  const isUserAdmin = isAdmin();
  
  // Use notifications hook for real-time updates
  const { 
    unreadCount, 
    notifications, 
    refreshCount, 
    refreshNotifications 
  } = useNotifications();

  // Dynamic breadcrumbs
  const pathnames = location.pathname.split('/').filter(Boolean);

  // Determine the correct profile path based on current location
  // Remove profile option for Chief Engineer (admin)
  const getProfilePath = () => {
    if (isUserAdmin) {
      return null; // No profile for Chief Engineer/Admin
    }
    
    const userRole = getCurrentUserRole();
    if (userRole === 'landowner') {
      return null; // No profile for landowners yet
    }
    
    if (location.pathname.startsWith('/pe-dashboard')) {
      return '/pe-dashboard/profile';
    } else if (location.pathname.startsWith('/fo-dashboard')) {
      return '/fo-dashboard/profile';
    }
    return '/dashboard/profile';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setOpen(false); // Close dropdown
      logout(); // Call logout function
    }
  };

  const handleNotificationsRefresh = () => {
    refreshCount();
    refreshNotifications();
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 w-full shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Left Side: Logo + Breadcrumb */}
        <div className="flex items-center space-x-6">
          <Logo />
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="text-gray-500 hover:text-orange-500 font-medium">
              Home
            </Link>
            {pathnames.map((segment, index) => {
              const to = '/' + pathnames.slice(0, index + 1).join('/');
              const isLast = index === pathnames.length - 1;
              return (
                <span key={to} className="flex items-center space-x-2">
                  <span className="text-gray-400">›</span>
                  <Link
                    to={to}
                    className={`hover:text-orange-500 ${
                      isLast
                        ? 'text-orange-500 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4 relative">
          {/* Real-time Notification Bell */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onRefresh={handleNotificationsRefresh}
          />

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full border border-gray-300 object-cover"
              />
              <ChevronDown className="text-gray-500" size={16} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                {/* Only show profile option if not admin */}
                {!isUserAdmin && getProfilePath() && (
                  <>
                    <Link
                      to={getProfilePath()}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <span>View Profile</span>
                    </Link>
                    <hr className="border-gray-100" />
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
