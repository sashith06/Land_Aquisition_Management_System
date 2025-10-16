import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, ArrowRight, MapPin, Clock } from 'lucide-react';

const Services = () => {
  return (
    <section id="services" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-green-50 via-teal-50 to-green-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-green-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <BarChart3 size={16} className="mr-2" />
            Our Digital Services
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Streamlined 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600"> Digital Solutions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access comprehensive land acquisition services through our modern digital platform designed for efficiency and transparency.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Property and Progress Card */}
          <Link 
            to="/landowner" 
            className="group relative block overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700"></div>
            <img
              src="/image3.png"
              alt="Property tracking and management"
              className="w-full h-[400px] md:h-[500px] object-cover object-center transition-transform duration-700 group-hover:scale-110 opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-white">
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText size={32} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Property & Progress Tracking</h3>
                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                  Access comprehensive property information, track acquisition progress in real-time, manage important documents, and submit inquiries through our integrated platform.
                </p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-6">

                <div className="flex items-center text-sm text-gray-300">
                  <Clock size={16} className="mr-2 text-blue-400" />
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <FileText size={16} className="mr-2 text-purple-400" />
                  <span>Document Management</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <BarChart3 size={16} className="mr-2 text-orange-400" />
                  <span>Progress Analytics</span>
                </div>
              </div>
              
              <div className="flex items-center text-green-300 font-semibold group-hover:text-green-200 transition-colors">
                <span className="mr-2">Explore Service</span>
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>


      </div>
    </section>
  );
};

export default Services;
