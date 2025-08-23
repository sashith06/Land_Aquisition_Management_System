import { Building2 } from "lucide-react";

const ProjectList = ({ projects, onSelect, selectedProject }) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Project Progress */}
            {project.progress !== undefined && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-600">
                  {project.progress}% Done
                </div>
              </div>
            )}

            {/* Created Date */}
            <p className="text-xs text-gray-400 mt-1">Created: {project.createdDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
