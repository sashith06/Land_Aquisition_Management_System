import { User } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ Import Link

const LoginButton = ({ className = '' }) => (
  <Link
    to="/login" // ✅ Navigates to login page
    className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2 ${className}`}
  >
    <User size={18} />
    <span>Login</span>
  </Link>
);

export default LoginButton;
