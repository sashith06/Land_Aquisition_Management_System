import { Home, Info, Target, Briefcase, Phone } from 'lucide-react';
import { HashLink } from 'react-router-hash-link';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/#' },
  { id: 'about', label: 'About', icon: Info, href: '/#about' },
  { id: 'mission', label: 'Mission', icon: Target, href: '/#mission-vision' },
  { id: 'services', label: 'Services', icon: Briefcase, href: '/#services' },
  { id: 'contact', label: 'Contact', icon: Phone, href: '/#contact' },
];

const FloatingMobileNav = ({ activeSection, setActiveSection }) => (
  <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
    <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-2 py-2 hover:shadow-3xl transition-all duration-300">
      <div className="flex items-center space-x-1">
        {navItems.map(({ id, label, icon: Icon, href }) => (
          <HashLink
            key={id}
            to={href}
            smooth
            onClick={() => setActiveSection(id)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-[60px] ${
              activeSection === id
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 hover:scale-105'
            }`}
          >
            <Icon size={18} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
            {activeSection === id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            )}
          </HashLink>
        ))}
      </div>
    </div>
  </div>
);

export default FloatingMobileNav;
