import React from 'react';
import { Target, Eye, Compass, Lightbulb } from 'lucide-react';

const MissionVision = () => {
  return (
    <section id="mission-vision" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Compass size={16} className="mr-2" />
            Our Purpose & Direction
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Mission & 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Vision</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Driving Sri Lanka's development through world-class highway infrastructure and innovative solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Mission Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Target size={32} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                As the premier national organization of the road sector, to develop and maintain the national 
                network of national highways, to ensure mobility and accessibility at an acceptable level of safety 
                and comfort, in the most effective and efficient manner, for the movement of people and goods 
                paying due for the socio-economic development of the nation.
              </p>
              
              {/* Mission Points */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Develop & maintain national highway network</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Ensure safety and comfort for all users</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>Support socio-economic development</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Eye size={32} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                "Empowering Connectivity, Driving Prosperity Sustainably: A Future-Ready Sri Lanka Connected by World-Class Roads."
              </p>
              
              {/* Vision Elements */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Lightbulb size={20} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Innovation</h4>
                  <p className="text-sm text-gray-600">Future-ready solutions</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Target size={20} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Sustainability</h4>
                  <p className="text-sm text-gray-600">Environmental focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;