const ProjectDetails = ({ project }) => {
  if (!project) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Project Details</h3>
        <p className="text-gray-500">Select a project to view details</p>
      </div>
    );
  }

  const details = [
    { label: "Project Name", value: project.name },
    { label: "Estimated Cost", value: project.estimatedCost },
    { label: "Estimated Extent", value: project.estimatedExtent },
    { label: "Project Date", value: project.projectDate },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Project Details</h3>
      
      {/* Project Image */}
      {project.image && (
        <div className="mb-6">
          <img
            src={project.image}
            alt="Project"
            className="w-full h-40 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Details list */}
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b pb-2 last:border-b-0"
          >
            <p className="text-sm font-medium text-gray-600">{detail.label}</p>
            <p className="text-sm font-semibold text-blue-700">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
