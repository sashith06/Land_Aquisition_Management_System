import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import RegisterButton from './RegisterButton';

const MobileNav = () => (
  <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
    <div className="flex flex-col space-y-4">
      {/* Internal section anchors (OK to use <a> for same-page scroll) */}
      <a href="#" className="text-orange-500 font-semibold px-2 py-1 rounded-lg">Home</a>
      <a href="#about" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">About Us</a>
      <a href="#mission-vision" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">Mission & Vision</a>
      <a href="#services" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">Services</a>
      <a href="#contact" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">Contact Us</a>

      {/* Full page navigation (login, register) */}
      <LoginButton />
      <RegisterButton />
    </div>
  </div>
);

export default MobileNav;
