import React from 'react';
import { SPECIALIZATIONS, SRI_LANKAN_CITIES } from '../../utils/constants';
import { FiFilter, FiX } from 'react-icons/fi';

const JobFilters = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({ specialization: '', city: '' });
  };

  const hasActiveFilters = filters.specialization || filters.city;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <FiFilter className="h-6 w-6" />
      </button>

      {/* Filter Panel */}
      <div className={`
        fixed inset-0 bg-dark-card z-50 transform transition-transform duration-300 lg:relative lg:transform-none lg:bg-transparent lg:z-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-0">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button onClick={() => setIsOpen(false)} className="p-2">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="w-full px-3 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cities</option>
                {SRI_LANKAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}

            {/* Apply Button for Mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full lg:hidden bg-primary-600 text-white py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobFilters;