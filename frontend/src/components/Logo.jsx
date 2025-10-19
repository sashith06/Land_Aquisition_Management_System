const Logo = () => (
  <div className="flex flex-col items-start leading-tight">
    <div className="h-8 w-auto overflow-hidden transition-transform duration-300 hover:scale-105">
      <img
        src="/logo.png"
        alt="MFA Logo"
        className="h-full w-auto object-contain"
      />
    </div>
    <span className="text-orange-600 font-extrabold text-sm tracking-wide">
      Miscellaneous Foreign Aid Projects
    </span>
  </div>
);

export default Logo;
