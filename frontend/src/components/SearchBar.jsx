
import { Search } from 'lucide-react';

const SearchBar = ({
  searchTerm,
  onSearchChange,
  heading = "Search",
  placeholder = "Search"
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{heading}</h3>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;