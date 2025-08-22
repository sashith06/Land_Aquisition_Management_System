import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { plansData } from '../data/mockData';

const Analysis = () => {
  const totalProjects = plansData.length;
  const completedProjects = plansData.filter(p => p.progress === 100).length;
  const inProgressProjects = plansData.filter(p => p.progress > 0 && p.progress < 100).length;
  const notStartedProjects = plansData.filter(p => p.progress === 0).length;
  const averageProgress = Math.round(plansData.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

  const stats = [
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

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analysis</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
          <div className="space-y-4">
            {plansData.map((project) => (
              <div key={project.id} className="flex items-center space-x-4">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="font-medium text-gray-800">{project.estimatedCost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;