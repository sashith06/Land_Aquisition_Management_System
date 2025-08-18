import React, { useState, useEffect } from 'react';
import { HashLink } from 'react-router-hash-link';
import { Menu, X, Home, Info, Target, Briefcase, Phone } from 'lucide-react';
import Logo from '../../components/Logo';
import LoginButton from '../../components/LoginButton';
import RegisterButton from '../../components/RegisterButton';

// Navigation data
const desktopNavItems = [
  { href: '/#', label: 'Home', isActive: true },
  { href: '/#about', label: 'About Us' },
  { href: '/#mission-vision', label: 'Mission & Vision' },
  { href: '/#services', label: 'Services' },
  { href: '/#contact', label: 'Contact Us' }
];

const mobileNavItems = [
  { id: 'home', label: 'Home', icon: Home, href: '/#' },
  { id: 'about', label: 'About', icon: Info, href: '/#about' },
  { id: 'mission', label: 'Mission', icon: Target, href: '/#mission-vision' },
  { id: 'services', label: 'Services', icon: Briefcase, href: '/#services' },
  { id: 'contact', label: 'Contact', icon: Phone, href: '/#contact' }
];

// Simple NavLink component
const NavLink = ({ href, label, isActive = false }) => (
  <HashLink
    smooth
    to={href}
    className={`relative font-medium transition-all duration-300 group whitespace-nowrap text-sm lg:text-base ${
      isActive 
        ? 'text-orange-500 font-semibold' 
        : 'text-gray-600 hover:text-orange-500'
    }`}
  >
    {label}
    <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-orange-500 transition-all duration-300 ${
      isActive ? 'w-full' : 'w-0 group-hover:w-full'
    }`} />
  </HashLink>
);

// Desktop Navigation
const DesktopNav = () => (
  <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 whitespace-nowrap">
    {desktopNavItems.map((item) => (
      <NavLink key={item.label} {...item} />
    ))}
  </nav>
);

// Mobile Menu Toggle
const MobileMenuButton = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden text-gray-600 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-50 transition-all duration-300"
  >
    {isOpen ? <X size={24} /> : <Menu size={20} />}
  </button>
);

// Mobile Dropdown Menu
const MobileNav = () => (
  <div className="lg:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-xl">
    <div className="flex flex-col space-y-4">
      <a href="/#" className="text-orange-500 font-semibold px-2 py-1 rounded-lg">
        Home
      </a>
      <a href="/#about" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">
        About Us
      </a>
      <a href="/#mission-vision" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">
        Mission & Vision
      </a>
      <a href="/#services" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">
        Services
      </a>
      <a href="/#contact" className="text-gray-600 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50">
        Contact Us
      </a>
      <LoginButton />
      <RegisterButton />
    </div>
  </div>
);

// Floating Mobile Navigation
const FloatingMobileNav = ({ activeSection, setActiveSection }) => (
  <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
    <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl px-2 py-2">
      <div className="flex items-center space-x-1">
        {mobileNavItems.map(({ id, label, icon: Icon, href }) => (
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
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </HashLink>
        ))}
      </div>
    </div>
  </div>
);

// Main Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Header */}
      <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-white/20'
          : 'bg-white shadow'
      }`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1 md:py-2">
            
            {/* Logo */}
            <div className="flex-1 min-w-[150px]">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="flex-1 justify-center hidden lg:flex">
              <DesktopNav />
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center justify-end flex-1 space-x-2">
              <LoginButton />
              <RegisterButton />
            </div>

            {/* Mobile Menu Button */}
            <MobileMenuButton isOpen={isMenuOpen} onClick={toggleMenu} />
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && <MobileNav />}
        </div>
      </header>

      {/* Floating Mobile Nav */}
      <FloatingMobileNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
    </>
  );
};

export default Header;