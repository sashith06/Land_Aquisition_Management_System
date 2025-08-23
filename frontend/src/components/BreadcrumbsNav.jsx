// src/components/BreadcrumbsNav.jsx
import React from "react";

const BreadcrumbsNav = ({ selectedProject, onBack }) => {
  return (
  <nav className="text-sm text-gray-600 mb-4">
    {!selectedProject ? (
      <span className="font-medium">Projects</span>
    ) : (
      <>
        <span
          className="cursor-pointer hover:underline"
          onClick={onBack}
        >
          Projects
        </span>{" "}
        / <span className="font-medium">{selectedProject.name}</span>
      </>
    )}
  </nav>
);

};

export default BreadcrumbsNav;
