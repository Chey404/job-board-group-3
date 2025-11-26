import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import { JobPosting } from '../types';
import { DataService } from '../services/dataService';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobPostings = await DataService.getApprovedJobs();
      setJobs(jobPostings);
      setFilteredJobs(jobPostings);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setJobs([]);
      setFilteredJobs([]);
      setError('We could not load jobs right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Debounce search input to avoid hammering the backend
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    const filterJobs = async () => {
      if (debouncedSearch || selectedJobType !== 'all' || selectedIndustry !== 'all') {
        try {
          const filtered = await DataService.searchJobs(debouncedSearch, selectedJobType, selectedIndustry);
          setFilteredJobs(filtered);
        } catch (err) {
          console.error('Failed to filter jobs:', err);
          // Fallback to client-side filtering
          let filtered = jobs;

          if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            filtered = filtered.filter(job =>
              job.title.toLowerCase().includes(q) ||
              job.company.toLowerCase().includes(q) ||
              job.description.toLowerCase().includes(q)
            );
          }

          if (selectedJobType !== 'all') {
            filtered = filtered.filter(job => job.jobType.toLowerCase() === selectedJobType.toLowerCase());
          }

          if (selectedIndustry !== 'all') {
            filtered = filtered.filter(job => job.industry === selectedIndustry);
          }

          setFilteredJobs(filtered);
        }
      } else {
        setFilteredJobs(jobs);
      }
    };

    filterJobs();
  }, [jobs, debouncedSearch, selectedJobType, selectedIndustry]);

  // Optional: block non-students from this page
  if (user && user.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="dashboard-container">
          <main className="dashboard-main">
            <div className="dashboard-content">
              <div className="welcome-section">
                <h1>Loading opportunities…</h1>
                <p>Please wait while we fetch the latest jobs.</p>
              </div>
              <div className="jobs-section">
                <div className="empty-state">
                  <h3>Loading</h3>
                  <p>Fetching job listings.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="dashboard-container">
          <main className="dashboard-main">
            <div className="dashboard-content">
              <div className="welcome-section">
                <h1>Something went wrong</h1>
                <p>{error}</p>
              </div>
              <button className="apply-button" onClick={loadJobs}>
                Retry loading jobs
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <div className="dashboard-container">
        <main className="dashboard-main">
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Welcome back, {user?.firstName}!</h1>
              <p>Discover your next opportunity with DawgsConnect</p>
            </div>

            <JobFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedJobType={selectedJobType}
              onJobTypeChange={setSelectedJobType}
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
              jobCount={filteredJobs.length}
            />

            <div className="jobs-section">
              {filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <h3>No jobs found</h3>
                  <p>Try adjusting your search criteria or check back later for new opportunities.</p>
                </div>
              ) : (
                <div className="jobs-grid">
                  {filteredJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
