import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>

        {items.map((item, idx) => (
          <li key={idx}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />

              {item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 bg-transparent border-none p-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ) : item.to ? (
                <Link
                  to={item.to}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
