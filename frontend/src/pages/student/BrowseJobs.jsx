import React, { useState } from 'react';
import { useJobs } from '../../hooks/useJobs';
import { useStudent } from '../../hooks/useStudent';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import JobResults from '../../components/student/JobResults';
import Loader from '../../components/common/Loader';
import { FiSearch, FiMapPin, FiBriefcase, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BrowseJobs = () => {
  const { user } = useAuth();
  const { useActiveJobs } = useJobs();
  const { saveJob, unsaveJob, useSavedJobs } = useStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
  });
  const [page, setPage] = useState(1);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data: savedJobsData } = useSavedJobs();
  
  // Use the API hook directly with our state
  const { data, isLoading } = useActiveJobs({
    search: debouncedSearch,
    specialization: filters.specialization,
    city: filters.city,
    page,
    limit: 10,
  });

  const savedJobIds = savedJobsData?.data?.map(job => job._id) || [];

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }
    await saveJob(jobId);
  };

  const handleUnsaveJob = async (jobId) => {
    await unsaveJob(jobId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (isLoading && !data) return <div className="min-h-screen flex items-center justify-center bg-dark-base"><Loader /></div>;

  return (
    <div className="min-h-screen bg-dark-base lg:bg-[#080d1e]">
      
      {/* Top Banner Region */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="mb-10 text-center lg:text-left">
          <p className="text-primary-500 font-bold tracking-widest uppercase text-xs mb-3">Career Opportunities</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Find your next internship <span className="text-primary-500">milestone.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0">
            Connect with elite firms looking for dynamic thinkers and creative visionaries to build the future of work.
          </p>
        </div>

        {/* Floating Search Pill */}
        <div className="bg-dark-card border border-slate-700/50 rounded-full shadow-2xl p-2.5 flex flex-col md:flex-row items-center gap-2 mt-8 z-20 relative">
           
           <div className="flex-1 flex items-center bg-dark-base rounded-full px-4 py-2 md:py-0 md:bg-transparent md:px-6 w-full md:w-auto h-12">
              <FiSearch className="text-slate-400 w-5 h-5 flex-shrink-0" />
              <input 
                 type="text" 
                 placeholder="Job title, keywords, or company" 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                 className="w-full bg-transparent border-none text-white focus:ring-0 px-3 placeholder-slate-500 text-sm"
              />
           </div>

           <div className="hidden md:block w-px h-8 bg-slate-700 mx-2"></div>

           <div className="flex-1 flex items-center px-4 w-full md:w-auto justify-between bg-dark-base md:bg-transparent rounded-full md:rounded-none h-12">
              <div className="flex items-center gap-2 flex-1 relative">
                 <FiMapPin className="text-slate-400 w-4 h-4 absolute left-0" />
                 <select 
                    value={filters.city}
                    onChange={(e) => { setFilters({...filters, city: e.target.value}); setPage(1); }}
                    className="w-full bg-transparent border-none text-slate-300 focus:ring-0 pl-7 py-0 appearance-none text-sm cursor-pointer"
                 >
                    <option value="">Any Location</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Remote">Remote</option>
                 </select>
              </div>
           </div>

           <div className="hidden md:block w-px h-8 bg-slate-700 mx-2"></div>

           <div className="flex-1 flex items-center px-4 w-full md:w-auto justify-between bg-dark-base md:bg-transparent rounded-full md:rounded-none h-12">
              <div className="flex items-center gap-2 flex-1 relative">
                 <FiBriefcase className="text-slate-400 w-4 h-4 absolute left-0" />
                 <select 
                    value={filters.specialization}
                    onChange={(e) => { setFilters({...filters, specialization: e.target.value}); setPage(1); }}
                    className="w-full bg-transparent border-none text-slate-300 focus:ring-0 pl-7 py-0 appearance-none text-sm cursor-pointer"
                 >
                    <option value="">Any Specialization</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Business Analysis">Business Analysis</option>
                 </select>
              </div>
           </div>
           
           <button 
             onClick={handleSearchSubmit}
             className="w-full md:w-auto px-8 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-colors flex-shrink-0 shadow-lg shadow-primary-600/20"
           >
             Search
           </button>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10 -mt-2">
           <JobResults
             jobs={data?.data || []}
             savedJobs={savedJobIds}
             onSave={handleSaveJob}
             onUnsave={handleUnsaveJob}
             pagination={data?.pagination}
             currentPage={page}
             onPageChange={setPage}
             isLoading={isLoading}
             layout="grid"
           />
      </div>

    </div>
  );
};

export default BrowseJobs;