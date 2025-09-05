import { Menu, X } from 'lucide-react';

const MobileMenuButton = ({ isOpen, toggleMenu }) => (
  <button
    onClick={toggleMenu}
    className="lg:hidden text-gray-600 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-all duration-300"
  >
    {isOpen ? <X size={24} /> : <Menu size={20} />}
  </button>
);
export default MobileMenuButton;