const Logo = () => (
  <div className="flex flex-col items-start space-y-2">
    <div className="w-100 h-100 md:w-40 md:h-10 overflow-hidden transition-transform duration-300 hover:scale-105">
      <img
        src="/logo.png"  // Make sure your logo is in the public folder
        alt="MFA Logo"
        className="w-full h-full object-contain"
      />
    </div>
    <h3 className="text-orange-600 font-extrabold text-xl md:text-2xl tracking-wide">Miscellaneous Foriegn Aid Projects</h3>
  </div>
);

export default Logo;
