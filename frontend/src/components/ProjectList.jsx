import { Building2, Edit2, Trash2, UserCheck, Eye } from "lucide-react";
import { getCurrentUserFullName, isCurrentUserCreator } from "../utils/userUtils";

const ProjectList = ({ projects, onSelect, selectedProject, showActions = false, onEdit, onDelete, assignedProjects = [], userRole }) => {
  // Check if a project is assigned to current land officer
  const isAssignedProject = (projectId) => {
    return assignedProjects.some(project => project.id === projectId);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          // Check if current user is the creator of this project
          const isCreator = isCurrentUserCreator(project.creator_name);
          const isAssigned = isAssignedProject(project.id);

          return (
            <div
              key={project.id}
              onClick={() => onSelect(project)}
              className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col space-y-4
                ${selectedProject?.id === project.id
                  ? "border-orange-500 shadow-lg"
                  : "border-gray-200 hover:border-orange-300"
                }`}
            >
              {/* Project Header */}
              <div className="flex items-center space-x-3">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-lg text-gray-800">{project.name}</p>
                    {userRole === 'land_officer' && (
                      isAssigned ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <UserCheck size={12} />
                          <span>Assigned</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <Eye size={12} />
                          <span>View Only</span>
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{project.description}</p>
                </div>
              </div>

              {/* Created by Project Engineer */}
              <p className="text-xs text-gray-400 mt-1">
                Created by: {project.creator_name || 'Project Engineer'}
              </p>

              {/* Action Buttons - Only show for creators */}
              {showActions && isCreator && (
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(project);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                        onDelete(project.id);
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}

              {/* View-only indicator for non-creators */}
              {showActions && !isCreator && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">View only - Created by another Project Engineer</p>
                </div>
              )}

              {/* Assignment status for land officers */}
              {userRole === 'land_officer' && !showActions && (
                <div className="mt-2">
                  {isAssigned ? (
                    <p className="text-xs text-green-600 font-medium">✓ You can create plans for this project</p>
                  ) : (
                    <p className="text-xs text-gray-500">⚠ View only - Not assigned to this project</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;
