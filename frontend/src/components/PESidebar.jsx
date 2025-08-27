import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  MessageSquare,
  FileText,
  Plus,
} from "lucide-react";

// Project Engineer specific navigation items (removed User Management and Project Requests)
const peNavigationItems = [
  { path: '/pe-dashboard/analysis', label: 'Analysis', icon: 'BarChart3' },
  { path: '/pe-dashboard/messages', label: 'Messages', icon: 'MessageSquare', badge: 3 },
  { path: '/pe-dashboard/reports', label: 'Reports', icon: 'FileText' },
  { path: '/pe-dashboard/create-project', label: 'Create Project', icon: 'Plus' },
];

const iconMap = {
  BarChart3,
  MessageSquare,
  FileText,
  Plus,
};

const PESidebar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavItem = ({ item }) => {
    const IconComponent = iconMap[item.icon];
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        aria-current={active ? "page" : undefined}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          active
            ? "bg-orange-500 text-white shadow-lg"
            : "text-gray-100 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <div className="relative">
          <IconComponent size={20} />
          {item.badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </div>
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="bg-slate-900 text-white w-64 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Project Engineer</h2>
        <p className="text-sm text-gray-300">Control Panel</p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2">
        {peNavigationItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="text-xs text-gray-400">
          Project Engineer Dashboard v1.0
        </div>
      </div>
    </div>
  );
};

export default PESidebar;
