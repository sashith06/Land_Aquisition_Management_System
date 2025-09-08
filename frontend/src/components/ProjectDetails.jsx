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
    { label: "Status", value: project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'N/A' },
    { label: "Estimated Cost", value: project.initial_estimated_cost ? `Rs. ${parseFloat(project.initial_estimated_cost).toLocaleString()}` : 'N/A' },
    { label: "Extent (Hectares)", value: project.initial_extent_ha ? `${project.initial_extent_ha} ha` : 'N/A' },
    { label: "Extent (Perches)", value: project.initial_extent_perch ? `${project.initial_extent_perch} perches` : 'N/A' },
    { label: "Created by", value: project.creator_name || 'Project Engineer' },
    { label: "Created Date", value: project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A' },
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
