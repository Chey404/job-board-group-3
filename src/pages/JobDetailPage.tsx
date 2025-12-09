import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPosting } from '../types';
import { DataService } from '../services/dataService';
import { GraphQLService } from '../services/graphqlService';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import './JobDetailPage.css';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationDate, setApplicationDate] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError('Job ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Increment view count when job is viewed
        await DataService.incrementJobViewCount(id);

        // Fetch job details
        const jobData = await DataService.getJobById(id);
        
        if (!jobData) {
          setError('Job not found');
        } else {
          setJob(jobData);
          
          // Check if student has already applied
          if (user && user.role === 'STUDENT' && user.email) {
            try {
              const applied = await GraphQLService.hasStudentApplied(user.email, id);
              setHasApplied(applied);
              
              // If already applied, fetch the application date
              if (applied) {
                const applications = await GraphQLService.getStudentApplications(user.email);
                const thisApplication = applications.find(app => app.jobId === id);
                if (thisApplication) {
                  setApplicationDate(thisApplication.appliedAt);
                }
              }
            } catch (err) {
              console.error('Error checking application status:', err);
              // Don't block page load if application check fails
            }
          }
        }
      } catch (err) {
        console.error('Failed to load job:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, user]);

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPostedDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Posted 1 day ago';
    } else if (diffDays < 7) {
      return `Posted ${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getJobTypeDisplay = (jobType: string) => {
    switch (jobType) {
      case 'INTERNSHIP':
        return 'Internship';
      case 'FULL_TIME':
        return 'Full-time';
      case 'CONTRACT':
        return 'Contract';
      default:
        return jobType;
    }
  };

  const handleBackToJobs = () => {
    navigate('/dashboard');
  };

  const handleApply = async () => {
    if (!job || !user?.email) return;

    try {
      // Only create application record for students
      if (user.role === 'STUDENT') {
        try {
          await GraphQLService.createApplication(user.email, job.id);
          setHasApplied(true);
          setApplicationDate(new Date().toISOString());
        } catch (appError: any) {
          // Handle duplicate application error
          if (appError.message?.includes('already applied')) {
            alert('You have already applied to this position');
            setHasApplied(true);
            return;
          }
          throw appError;
        }
      }

      // Increment application count for all users
      await DataService.updateJob(job.id, {
        applicationCount: job.applicationCount + 1
      });

      // Update local state
      setJob(prev => prev ? { ...prev, applicationCount: prev.applicationCount + 1 } : null);

      // Handle contact method (email or careers page)
      if (job.contactMethod.type === 'EMAIL') {
        const subject = encodeURIComponent(`Application for ${job.title}`);
        const body = encodeURIComponent(
          `Dear Hiring Manager,\n\nI am interested in applying for the ${job.title} position at ${job.company}.\n\nBest regards`
        );
        window.open(`mailto:${job.contactMethod.value}?subject=${subject}&body=${body}`);
      } else if (job.contactMethod.type === 'CAREERS_PAGE') {
        window.open(job.contactMethod.value, '_blank');
      }
    } catch (error) {
      console.error('Error handling apply action:', error);
      alert('Unable to process application. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <Navigation />
        <main className="job-detail-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-container">
        <Navigation />
        <main className="job-detail-main">
          <div className="error-state">
            <h2>Job Not Found</h2>
            <p>{error || 'The job you are looking for could not be found.'}</p>
            <button onClick={handleBackToJobs} className="back-button">
              Back to Jobs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <Navigation />
      
      <main className="job-detail-main">
        <div className="job-detail-content">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <button onClick={handleBackToJobs} className="breadcrumb-link">
              ← Back to Jobs
            </button>
          </nav>

          {/* Job Header */}
          <header className="job-header">
            <div className="job-title-section">
              <h1 className="job-title">{job.title}</h1>
              <div className="company-info">
                <h2 className="company-name">{job.company}</h2>
                <span className="industry">{job.industry}</span>
              </div>
            </div>
            
            <div className="job-meta-badges">
              <span className={`job-type-badge job-type-${job.jobType.toLowerCase()}`}>
                {getJobTypeDisplay(job.jobType)}
              </span>
              <span className="status-badge status-approved">
                Active
              </span>
            </div>
          </header>

          {/* Job Metadata */}
          <div className="job-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Posted:</span>
              <span className="metadata-value">
                {job.createdAt ? formatPostedDate(job.createdAt) : 'Recently'}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Application Deadline:</span>
              <span className="metadata-value deadline">
                {formatDeadline(job.deadline)}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Views:</span>
              <span className="metadata-value">{job.viewCount}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Applications:</span>
              <span className="metadata-value">{job.applicationCount}</span>
            </div>
          </div>

          {/* Job Content */}
          <div className="job-content">
            {/* Job Description */}
            <section className="job-section">
              <h3>Job Description</h3>
              <div className="job-description">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Required Skills */}
            <section className="job-section">
              <h3>Required Skills</h3>
              <div className="skills-grid">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Contact Information */}
            <section className="job-section">
              <h3>How to Apply</h3>
              <div className="contact-info">
                {job.contactMethod.type === 'EMAIL' ? (
                  <div className="contact-method">
                    <p>Send your application via email:</p>
                    <div className="contact-value">
                      <strong>{job.contactMethod.value}</strong>
                    </div>
                    <p className="contact-instructions">
                      Click "Apply for this Position" below to open your email client with a pre-filled subject line.
                    </p>
                  </div>
                ) : (
                  <div className="contact-method">
                    <p>Apply through the company's career page:</p>
                    <div className="contact-value">
                      <a 
                        href={job.contactMethod.value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="careers-link"
                      >
                        {job.contactMethod.value}
                      </a>
                    </div>
                    <p className="contact-instructions">
                      Click "Apply for this Position" below to open the application page in a new tab.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="job-actions">
            <button 
              onClick={handleApply}
              className="apply-button primary"
              aria-label={`Apply for ${job.title} at ${job.company}`}
            >
              Apply for this Position
            </button>
            <button 
              onClick={handleBackToJobs}
              className="back-button secondary"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;