import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  FileText,
  DollarSign,
} from "lucide-react";
import useMessageCount from "../hooks/useMessageCount";

// Financial Officer specific navigation items
const foNavigationItems = [
  { path: '/fo-dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/fo-dashboard/financial-reports', label: 'Financial Reports', icon: 'DollarSign' },
  { path: '/fo-dashboard/analysis', label: 'Analysis', icon: 'BarChart3' },
  { path: '/fo-dashboard/reports', label: 'Reports', icon: 'FileText' },
];

const iconMap = {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  FileText,
  DollarSign,
};

const FOSidebar = () => {
  const location = useLocation();
  const { unreadCount } = useMessageCount();

  // Add messages to navigation items with dynamic badge
  const navigationItems = [
    ...foNavigationItems.slice(0, 3), // Dashboard, Financial Reports, Analysis
    { 
      path: '/fo-dashboard/messages', 
      label: 'Messages', 
      icon: 'MessageSquare',
      badge: unreadCount > 0 ? unreadCount : null
    },
    ...foNavigationItems.slice(3) // Reports
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ item }) => {
    const IconComponent = iconMap[item.icon];
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
          active
            ? "bg-orange-500 text-white shadow-lg"
            : "text-gray-100 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <IconComponent size={20} />
            {item.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </div>
          <span className="font-medium">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-slate-900 text-white w-64 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Financial Officer</h2>
            <p className="text-sm text-gray-300">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="text-xs text-gray-400">
          Financial Officer Dashboard v1.0
        </div>
      </div>
    </div>
  );
};

export default FOSidebar;
