import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterButton = ({ className = '' }) => (
  <Link
    to="/register"
    className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 ${className}`}
  >
    <UserPlus size={18} />
    <span>Register</span>
  </Link>
);

export default RegisterButton;
