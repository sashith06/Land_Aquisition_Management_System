import { Building2, Edit2, Trash2 } from "lucide-react";

const ProjectList = ({ projects, onSelect, selectedProject, showActions = false, onEdit, onDelete }) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
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
              <div>
                <p className="font-bold text-lg text-gray-800">{project.name}</p>
                <p className="text-sm text-gray-500 truncate">{project.description}</p>
              </div>
            </div>

            {/* Created Date */}
            <p className="text-xs text-gray-400 mt-1">Created: {project.createdDate}</p>

            {/* Action Buttons for PE Dashboard */}
            {showActions && (
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
