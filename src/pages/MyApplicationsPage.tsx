import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import { Application } from '../types';
import { GraphQLService } from '../services/graphqlService';
import './MyApplicationsPage.css';

const MyApplicationsPage: React.FC = () => {
  // State
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();

  // Access control - redirect non-students to dashboard
  useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load applications on component mount
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      loadApplications();
    }
  }, [user]);

  // Load applications function
  const loadApplications = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const apps = await GraphQLService.getApplicationsWithJobDetails(user.email);
      setApplications(apps);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to job detail page
  const handleViewJob = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Navigation />
      <div className="my-applications-container">
        <div className="my-applications-content">
          {/* Header Section */}
          <div className="applications-header">
            <h1>My Applications</h1>
            <p className="applications-count">
              {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your applications...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadApplications} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && applications.length === 0 && (
            <div className="empty-state">
              <h3>No Applications Yet</h3>
              <p>You haven't applied to any jobs yet. Explore opportunities on the job board!</p>
              <button onClick={() => navigate('/dashboard')} className="explore-button">
                Explore Job Board
              </button>
            </div>
          )}

          {/* Applications List */}
          {!loading && !error && applications.length > 0 && (
            <div className="applications-list">
              {applications.map((application) => (
                <div 
                  key={`${application.studentEmail}-${application.jobId}`}
                  className="application-card"
                  onClick={() => handleViewJob(application.jobId)}
                >
                  {application.job ? (
                    <>
                      <div className="application-header">
                        <h3 className="job-title">{application.job.title}</h3>
                        <span className={`status-badge status-${application.job.status.toLowerCase()}`}>
                          {application.job.status}
                        </span>
                      </div>
                      <div className="application-details">
                        <p className="company-name">{application.job.company}</p>
                        <div className="job-meta">
                          <span className="job-industry">{application.job.industry}</span>
                          <span className="job-type">{application.job.jobType.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="application-footer">
                        <p className="applied-date">Applied on {formatDate(application.appliedAt)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="application-header">
                        <h3 className="job-title">Job No Longer Available</h3>
                        <span className="status-badge status-unavailable">UNAVAILABLE</span>
                      </div>
                      <div className="application-details">
                        <p className="company-name">This job posting has been removed</p>
                      </div>
                      <div className="application-footer">
                        <p className="applied-date">Applied on {formatDate(application.appliedAt)}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyApplicationsPage;
