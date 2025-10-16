import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const Contact = () => {

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <MessageSquare size={16} className="mr-2" />
            Get In Touch
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Contact 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600"> Our Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our services? We're here to help you navigate through our digital platform and processes.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Phone size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">+94 11 2 046200</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mail size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">info@rda.gov.lk</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <MapPin size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600">Battaramulla, Sri Lanka</p>
          </div>
        </div>

        {/* Location Map */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/20">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Location</h3>
              <p className="text-gray-600">Visit us at our headquarters in Battaramulla</p>
            </div>
            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.885065633298!2d79.92338047475687!3d6.9043454930950015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae257002e758821%3A0x4d415a164f5abff0!2sMiscellaneous%20Foreign%20Aided%20Projects%20Division!5e0!3m2!1sen!2slk!4v1753713923936!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;