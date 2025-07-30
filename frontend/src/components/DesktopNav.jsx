import NavLink from './NavLink';

const DesktopNav = () => (
  <nav className="hidden lg:flex items-center justify-center flex-1 space-x-8 w-full max-w-6xl mx-auto">
    <NavLink href="#" label="Home" isActive />
    <NavLink href="#about" label="About Us" />
    <NavLink href="#mission-vision" label="Mission & Vision" />
    <NavLink href="#services" label="Services" />
    <NavLink href="#contact" label="Contact Us" />
  </nav>
);
export default DesktopNav;
