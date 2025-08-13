import { Bell, ChevronDown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { userData } from '../data/mockData';
import Logo from './Logo';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Dynamic breadcrumbs
  const pathnames = location.pathname.split('/').filter(Boolean);

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
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 hover:text-gray-800">
            <Bell size={20} />
            {userData.notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {userData.notifications}
              </span>
            )}
          </button>

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-10 h-10 rounded-full border border-gray-300 object-cover"
              />
              <ChevronDown className="text-gray-500" size={16} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={() => alert('Logging out...')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
