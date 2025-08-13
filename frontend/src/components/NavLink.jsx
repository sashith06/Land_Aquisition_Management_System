// NavLink.jsx
import React from 'react';
import { HashLink } from 'react-router-hash-link';

const NavLink = ({ href, label, isActive = false, onClick }) => (
  <HashLink
    smooth
    to={href}
    onClick={onClick}
    className={`relative font-medium transition-all duration-300 group ${
      isActive ? 'text-orange-500 font-semibold' : 'text-gray-600 hover:text-orange-500'
    }`}
  >
    {label}
    <span
      className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-orange-500 transition-all duration-300 ${
        isActive ? 'w-full' : 'w-0 group-hover:w-full'
      }`}
    ></span>
  </HashLink>
);

export default NavLink;
