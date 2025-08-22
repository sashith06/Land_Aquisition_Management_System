import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Info,
} from "lucide-react";
import { navigationItems } from "../data/mockData";

const iconMap = {
  LayoutDashboard,
  User,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Info,
};

const Sidebar = () => {
  const location = useLocation();

  const bottomItems = [
    { path: "/settings", label: "Settings", icon: "Settings" },
    { path: "/info", label: "Info", icon: "Info" },
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
      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2 mt-4">
        {navigationItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 py-6 border-t border-slate-700 space-y-2">
        {bottomItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
