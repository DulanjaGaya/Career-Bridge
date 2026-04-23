import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const JobSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            onSearch(value);
          }}
          placeholder="Search by job title, company, or skills..."
          className="w-full pl-12 pr-12 py-4 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
      >
        Search
      </button>
    </form>
  );
};

export default JobSearch;