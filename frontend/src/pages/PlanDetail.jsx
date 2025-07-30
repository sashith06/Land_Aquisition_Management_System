import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, MapPin, TrendingUp } from 'lucide-react';
import { plansData } from '../data/mockData';

const PlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get plan data from location state or find by ID
  const plan = location.state?.plan || plansData.find(p => p.id === id);
  
  if (!plan) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">The requested plan could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Plan {plan.id}</h1>
            <p className="text-gray-600">{plan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <img
                src={plan.image}
                alt={plan.name}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Project Description</h2>
              <p className="text-gray-700 leading-relaxed">
                This infrastructure development project is part of the Road Development Authority's 
                initiative to improve transportation networks across the region. The project involves 
                comprehensive road construction, bridge development, and supporting infrastructure 
                to enhance connectivity and economic growth.
              </p>
            </div>

            {/* Progress Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Progress Overview</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Overall Progress</span>
                    <span className="font-semibold text-gray-800">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {plan.progress > 0 ? Math.floor(plan.progress / 3) : 0}
                    </p>
                    <p className="text-sm text-green-700">Completed Tasks</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {plan.progress < 100 ? Math.floor((100 - plan.progress) / 4) : 0}
                    </p>
                    <p className="text-sm text-yellow-700">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {plan.progress < 100 ? Math.floor((100 - plan.progress) / 2) : 0}
                    </p>
                    <p className="text-sm text-gray-700">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Cost</p>
                    <p className="font-semibold text-gray-800">{plan.estimatedCost}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Extent</p>
                    <p className="font-semibold text-gray-800">{plan.estimatedExtent}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Project Date</p>
                    <p className="font-semibold text-gray-800">{plan.projectDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Progress Status</p>
                    <p className="font-semibold text-gray-800">
                      {plan.progress === 0 ? 'Not Started' : 
                       plan.progress === 100 ? 'Completed' : 'In Progress'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Edit Project
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Generate Report
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;