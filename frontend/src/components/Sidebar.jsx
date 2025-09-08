import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  BarChart3,
  MessageSquare,
  FileText,
} from "lucide-react";
import { navigationItems } from "../data/mockData";
import useMessageCount from "../hooks/useMessageCount";

const iconMap = {
  LayoutDashboard,
  User,
  BarChart3,
  MessageSquare,
  FileText,
};

const Sidebar = () => {
  const location = useLocation();
  const { unreadCount } = useMessageCount();

  // Add message count to navigation items
  const updatedNavigationItems = navigationItems.map(item => {
    if (item.path === '/dashboard/messages') {
      return {
        ...item,
        badge: unreadCount > 0 ? unreadCount : null
      };
    }
    return item;
  });

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
      {/* Sidebar Header */}
      <div className="px-4 py-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Land Officer</h1>
            <p className="text-sm text-gray-400">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2 mt-4">
        {updatedNavigationItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
