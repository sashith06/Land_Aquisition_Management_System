import { User, Mail, Phone, MapPin, Calendar, LogOut } from 'lucide-react';
import { userData } from '../data/mockData';
import { logout } from '../utils/auth';

const Profile = () => {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
              <p className="text-lg text-orange-600 font-medium">{userData.role}</p>
              <p className="text-gray-500">Road Development Authority</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">umesh.sandeepa@rda.gov.lk</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">+94 11 123 4567</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Office Location</p>
                  <p className="font-medium">Colombo Regional Office</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="text-orange-500" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">January 15, 2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;