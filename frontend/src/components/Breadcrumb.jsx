import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-orange-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                {item.label}
              </button>
            ) : item.to ? (
              <Link to={item.to} className="text-orange-600 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
