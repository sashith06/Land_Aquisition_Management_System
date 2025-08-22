import React from 'react';
import { Shield, Award, Globe, Users } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Shield size={16} className="mr-2" />
            About Our Division
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Leading Sri Lanka's 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Highway Development</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Content */}
          <div>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The Road Development Authority (RDA), incorporated as a statutory body under the Ministry of Highways by the RDA Act No.73 of 1981, became successor to the Department of Highways in 1988.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Since then, the RDA has become responsible for the maintenance and upgrading of the National Highway Network. Road Development Authority is one of the institutions under the Ministry of Highways which is the apex organization in Sri Lanka for the highways sector.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="/image2.png"  
              alt="Road construction and development"
              className="rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 w-full h-[400px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Statutory Authority</h3>
            <p className="text-gray-600">Established under RDA Act No.73 of 1981 as the premier highway development organization.</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
            <p className="text-gray-600">Committed to maintaining the highest standards in highway development and maintenance.</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Globe size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">National Network</h3>
            <p className="text-gray-600">Responsible for the entire National Highway Network across Sri Lanka.</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Public Service</h3>
            <p className="text-gray-600">Serving the nation through improved connectivity and transportation infrastructure.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;