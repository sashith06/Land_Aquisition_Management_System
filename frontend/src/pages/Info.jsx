import { Info as InfoIcon, Users, Target, Award, ExternalLink } from 'lucide-react';

const Info = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">System Information</h1>
        
        <div className="space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <InfoIcon className="text-orange-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">About This System</h2>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                The Miscellaneous Foreign Aided Projects Management System is a comprehensive 
                platform designed to streamline the management of infrastructure development 
                projects under the Road Development Authority.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This system enables efficient tracking of project progress, budget management, 
                land acquisition status, and environmental compliance for all foreign-aided 
                development initiatives.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="text-blue-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Key Features</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Project progress tracking</li>
                <li>• Interest Calculation</li>
                <li>• Real Time Dashboard</li>
                <li>• Environmental compliance</li>
                <li>• Real-time reporting</li>
                <li>• User Management</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">User Roles</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Land Officers</li>
                <li>• Project Managers</li>
                <li>• Finance Officers</li>
                <li>• System Administrators</li>
                <li>• Chief Engineers</li>
              </ul>
            </div>
          </div>

          {/* System Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="text-purple-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">System Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Version Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Build:</span>
                    <span className="font-medium">2025.01.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium">Production</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support Email:</span>
                    <span className="font-medium">support@rda.gov.lk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">+94 11 258 9000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Office Hours:</span>
                    <span className="font-medium">8:30 AM - 4:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Useful Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                <ExternalLink size={16} />
                <span>User Manual</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                <ExternalLink size={16} />
                <span>RDA Official Website</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                <ExternalLink size={16} />
                <span>Training Resources</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors">
                <ExternalLink size={16} />
                <span>Technical Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;