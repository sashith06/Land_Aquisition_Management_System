import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserProjects, getProjectStats } from '../api';

const Analysis = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch projects and stats in parallel
        const [projectsResponse, statsResponse] = await Promise.all([
          getUserProjects(),
          getProjectStats()
        ]);

        setProjects(projectsResponse.data || []);
        setStats(statsResponse.data || {});
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        setError('Failed to load analysis data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics from the fetched data
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'ongoing').length;
  const notStartedProjects = projects.filter(p => p.status === 'pending' || p.status === 'not_started').length;

  // Calculate average progress (assuming we have progress data)
  const averageProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
    : 0;

  const statsCards = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'In Progress',
      value: inProgressProjects,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Completed',
      value: completedProjects,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Not Started',
      value: notStartedProjects,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Average Progress',
      value: `${averageProgress}%`,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Analysis</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading analysis data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Analysis</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analysis</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={stat.color} size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Project Progress Overview</h2>
          {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No projects available for analysis.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center space-x-4">
                  <img
                    src={project.image || '/placeholder-project.jpg'}
                    alt={project.name || project.project_name || 'Project'}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-project.jpg';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">
                        {project.name || project.project_name || `Project ${project.id}`}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="font-medium text-gray-800">
                      Rs. {project.estimated_cost ? project.estimated_cost.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;