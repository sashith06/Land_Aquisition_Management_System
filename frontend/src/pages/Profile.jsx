import { User, Mail, LogOut } from 'lucide-react';
import { logout } from '../utils/auth';
import { getCurrentUser, getCurrentUserFullName, getUserAvatar } from '../utils/userUtils';
import { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
          <p className="text-gray-600">No user data found. Please login again.</p>
        </div>
      </div>
    );
  }

  const userName = getCurrentUserFullName();
  const userAvatar = getUserAvatar();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={userAvatar}
              alt={userName}
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
              <p className="text-lg text-orange-600 font-medium">{user.role}</p>
              <p className="text-gray-500">Road Development Authority</p>
              <p className="text-sm text-gray-400 mt-1">Status: {user.status || 'Active'}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium">{user.firstName || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium">{user.lastName || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user.role || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;