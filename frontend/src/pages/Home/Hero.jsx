import React from 'react';
import { ArrowRight, TrendingUp, Users, MapPin } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-blue-500/20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
              <MapPin size={16} className="mr-2" />
              Land Acquisition Management System
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Efficient & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Transparent</span>
              <br />Land Acquisition Process
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Track land acquisition progress, manage documents, and receive real-time updates with our centralized digital platform designed for efficiency and transparency.
            </p>
            

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-8">
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">20+</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Active Projects</div>
              </div>
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">10+</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Ongoing Projects</div>
              </div>
              <div className="text-center lg:text-left group">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Users size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">300+</div>
                <div className="text-sm md:text-base text-gray-600 font-medium">Active Users</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative group">
              <img
                src="/image6.png"
                alt="Highway through trees at sunrise"
                className="rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover object-center group-hover:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl"></div>
              
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Digital Transformation</h3>
                    <p className="text-sm text-gray-600">Modernizing land acquisition processes</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;