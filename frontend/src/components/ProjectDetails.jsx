const ProjectDetails = ({ project }) => {
  if (!project) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Project Details</h3>
        <p className="text-gray-500">Select a plan to view project details</p>
      </div>
    );
  }

  const details = [
    { label: 'Project Name', value: project.name, color: 'text-blue-600' },
    { label: 'Estimated Cost', value: project.estimatedCost, color: 'text-blue-600' },
    { label: 'Estimated Extent', value: project.estimatedExtent, color: 'text-blue-600' },
    { label: 'Project Date', value: project.projectDate, color: 'text-blue-600' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Project Details</h3>
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex items-center space-x-3">
            <img
              src={project.image}
              alt="Project"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500">{detail.label}</p>
              <p className={`font-semibold ${detail.color}`}>{detail.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;