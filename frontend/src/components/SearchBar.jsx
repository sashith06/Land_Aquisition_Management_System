import { Search } from "lucide-react";

const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Search</h3>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || "Search..."}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
        />
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  );
};

export default SearchBar;
