import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GraphQLService } from '../services/graphqlService';
import { JobPosting } from '../types';
import Navigation from '../components/Navigation';
import './MyJobPostingsPage.css';

const MyJobPostingsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchUserJobs();
    }
  }, [user]);

  const fetchUserJobs = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const jobs = await GraphQLService.getUserJobs(user.email);
      setJobPostings(jobs);
    } catch (err) {
      setError('Failed to load job postings. Please try again.');
      console.error('Error fetching user jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'status-badge status-approved';
      case 'PENDING':
        return 'status-badge status-pending';
      case 'DRAFT':
        return 'status-badge status-draft';
      case 'ARCHIVED':
        return 'status-badge status-archived';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'PENDING':
        return 'Pending Approval';
      case 'DRAFT':
        return 'Draft';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return status;
    }
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setShowEditModal(true);
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to archive this job posting?')) {
      return;
    }

    try {
      await GraphQLService.updateJob(jobId, { status: 'ARCHIVED' });
      await fetchUserJobs(); // Refresh the list
    } catch (err) {
      setError('Failed to archive job posting. Please try again.');
      console.error('Error archiving job:', err);
    }
  };

  const handleSaveEdit = async (updatedJob: JobPosting) => {
    try {
      // When editing, set status back to PENDING for re-approval
      const jobUpdate = {
        ...updatedJob,
        status: 'PENDING' as const
      };
      
      await GraphQLService.updateJob(updatedJob.id, jobUpdate);
      setShowEditModal(false);
      setEditingJob(null);
      await fetchUserJobs(); // Refresh the list
    } catch (err) {
      setError('Failed to update job posting. Please try again.');
      console.error('Error updating job:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="my-job-postings-page">
        <Navigation />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-job-postings-page">
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>My Job Postings</h1>
          <p>Manage and track your job postings</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchUserJobs} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {jobPostings.length === 0 && !loading && !error ? (
          <div className="empty-state">
            <h3>No job postings yet</h3>
            <p>You haven't created any job postings. Create your first posting to get started!</p>
            <button 
              onClick={() => window.location.href = '/create-job'} 
              className="create-job-button"
            >
              Create Job Posting
            </button>
          </div>
        ) : (
          <div className="job-postings-grid">
            {jobPostings.map((job) => (
              <div key={job.id} className="job-posting-card">
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <span className={getStatusBadgeClass(job.status)}>
                    {getStatusText(job.status)}
                  </span>
                </div>

                <div className="job-card-content">
                  <div className="job-info">
                    <p><strong>Company:</strong> {job.company}</p>
                    <p><strong>Industry:</strong> {job.industry}</p>
                    <p><strong>Type:</strong> {job.jobType.replace('_', ' ')}</p>
                    <p><strong>Deadline:</strong> 
                      <span className={isDeadlinePassed(job.deadline) ? 'deadline-passed' : ''}>
                        {formatDate(job.deadline)}
                        {isDeadlinePassed(job.deadline) && ' (Expired)'}
                      </span>
                    </p>
                  </div>

                  <div className="job-metrics">
                    <div className="metric">
                      <span className="metric-value">{job.viewCount}</span>
                      <span className="metric-label">Views</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{job.applicationCount}</span>
                      <span className="metric-label">Applications</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{job.description.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description}
                    </p>
                  </div>

                  <div className="job-skills">
                    <strong>Skills:</strong>
                    <div className="skills-list">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="skill-tag more-skills">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="job-card-actions">
                  {job.status !== 'ARCHIVED' && (
                    <>
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="edit-button"
                        disabled={job.status === 'PENDING'}
                      >
                        {job.status === 'PENDING' ? 'Under Review' : 'Edit'}
                      </button>
                      <button 
                        onClick={() => handleArchiveJob(job.id)}
                        className="archive-button"
                      >
                        Archive
                      </button>
                    </>
                  )}
                  {job.status === 'ARCHIVED' && (
                    <span className="archived-label">Archived</span>
                  )}
                </div>

                {job.status === 'PENDING' && (
                  <div className="pending-notice">
                    <p>This job posting is under admin review. You cannot edit it while it's being reviewed.</p>
                  </div>
                )}

                {job.adminComments && (
                  <div className="admin-comments">
                    <h4>Admin Comments:</h4>
                    <p>{job.adminComments}</p>
                    {job.approvedBy && (
                      <small>Reviewed by: {job.approvedBy}</small>
                    )}
                  </div>
                )}

                <div className="job-card-footer">
                  <small>
                    Created: {formatDate(job.createdAt || '')} | 
                    Updated: {formatDate(job.updatedAt || '')}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}

        {showEditModal && editingJob && (
          <EditJobModal
            job={editingJob}
            onSave={handleSaveEdit}
            onCancel={() => {
              setShowEditModal(false);
              setEditingJob(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Edit Job Modal Component
interface EditJobModalProps {
  job: JobPosting;
  onSave: (job: JobPosting) => void;
  onCancel: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState<JobPosting>(job);
  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactMethodChange = (field: 'type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      contactMethod: {
        ...prev.contactMethod,
        [field]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Job Posting</h2>
          <button onClick={onCancel} className="close-button">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Job Type *</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                required
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Application Deadline *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline.split('T')[0]}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Required Skills *</label>
            <div className="skills-input">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill and press Enter"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button type="button" onClick={handleAddSkill}>Add</button>
            </div>
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="remove-skill"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Contact Method *</label>
            <div className="contact-method">
              <select
                value={formData.contactMethod.type}
                onChange={(e) => handleContactMethodChange('type', e.target.value)}
                required
              >
                <option value="EMAIL">Email</option>
                <option value="CAREERS_PAGE">Company Career Page</option>
              </select>
              <input
                type={formData.contactMethod.type === 'EMAIL' ? 'email' : 'url'}
                value={formData.contactMethod.value}
                onChange={(e) => handleContactMethodChange('value', e.target.value)}
                placeholder={formData.contactMethod.type === 'EMAIL' ? 'recruiter@company.com' : 'https://company.com/careers'}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>

        <div className="edit-notice">
          <p><strong>Note:</strong> Editing this job posting will require admin re-approval before it becomes visible to students again.</p>
        </div>
      </div>
    </div>
  );
};

export default MyJobPostingsPage;