import React from 'react';
import { MapPin, Phone, Mail, ExternalLink, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative border-t-4 border-gradient-to-r from-orange-500 to-orange-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">RDA</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Road Development Authority</h3>
                  <p className="text-orange-400 text-sm font-medium">Miscellaneous Foreign Aided Projects</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                Leading Sri Lanka's highway development with innovative solutions and sustainable infrastructure 
                for a connected future.
              </p>
              
              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h4>
                <div className="space-y-2">
                  <a href="#" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors">
                    <ExternalLink size={16} className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Miscellaneous Foreign Aided Projects
                  </a>
                  <a href="#about" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors">
                    <ExternalLink size={16} className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    About RDA
                  </a>
                  <a href="#services" className="group flex items-center text-gray-300 hover:text-orange-400 transition-colors">
                    <ExternalLink size={16} className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    Digital Services
                  </a>
                </div>
              </div>
            </div>

            {/* Address Column */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-orange-400 flex items-center">
                <MapPin size={20} className="mr-2" />
                Address
              </h3>
              <div className="space-y-3 text-gray-300">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <p className="font-semibold mb-2 text-white">Road Development Authority</p>
                  <p className="text-sm leading-relaxed">
                    "Maganeguma Mahamedura"<br />
                    No: 216, Denzil Kobbekaduwa Mawatha,<br />
                    Koswatta, Battaramulla, Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-orange-400 flex items-center">
                <Phone size={20} className="mr-2" />
                Contact
              </h3>
              <div className="space-y-4">
                <div className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center text-gray-300 group-hover:text-orange-400 transition-colors">
                    <Phone size={18} className="mr-3 text-green-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm">+94 11 2 046200</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center text-gray-300 group-hover:text-orange-400 transition-colors">
                    <Mail size={18} className="mr-3 text-blue-400" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm">info@rda.gov.lk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Navigation */}
              <nav className="flex flex-wrap justify-center md:justify-start gap-6 mb-6 md:mb-0">
                <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                  Home
                </a>
                <a href="#about" className="text-gray-300 hover:text-orange-400 transition-colors">
                  About
                </a>
                <a href="#mission-vision" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Mission & Vision
                </a>
                <a href="#services" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Services
                </a>
                <a href="#contact" className="text-gray-300 hover:text-orange-400 transition-colors">
                  Contact Us
                </a>
              </nav>

              {/* Scroll to Top Button */}
              <button
                onClick={scrollToTop}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                aria-label="Scroll to top"
              >
                <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Copyright */}
            <div className="text-center mt-8 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                © 2025 Road Development Authority. All rights reserved. | Developed for efficient land acquisition management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;