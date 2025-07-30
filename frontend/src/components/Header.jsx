import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import DesktopNav from './DesktopNav';
import LoginButton from './LoginButton';
import MobileMenuButton from './MobileMenuButton';
import MobileNav from './MobileNav';
import FloatingMobileNav from './FloatingMobileNav';
import RegisterButton from './RegisterButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-white/20'
            : 'bg-white shadow'
        }`}
      >
       <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-1 md:py-2">
            {/* Logo (can resize inside Logo.jsx) */}
            <div className="flex-1 min-w-[150px]">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-end">
              <DesktopNav />
            </div>

            {/* Login/Register buttons */}
            <div className="hidden lg:flex items-center justify-end flex-1 space-x-2">
              <LoginButton />
              <RegisterButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <MobileMenuButton isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && <MobileNav />}
        </div>
      </header>

      <FloatingMobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </>
  );
};

export default Header;
