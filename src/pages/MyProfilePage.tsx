import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import { GraphQLService } from '../services/graphqlService';
import { User } from '../types';
import './MyProfilePage.css';

const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jobPostingsCount, setJobPostingsCount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    graduationYear: user?.graduationYear || undefined,
    companyName: user?.companyName || '',
    jobTitle: user?.jobTitle || '',
    industry: user?.industry || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        graduationYear: user.graduationYear,
        companyName: user.companyName || '',
        jobTitle: user.jobTitle || '',
        industry: user.industry || '',
      });
      
      // Load job postings count for company reps
      if (user.role === 'COMPANY_REP') {
        loadJobPostingsCount();
      }
    }
  }, [user]);

  const loadJobPostingsCount = async () => {
    if (!user?.email) return;
    
    try {
      const jobs = await GraphQLService.getUserJobs(user.email);
      setJobPostingsCount(jobs.length);
    } catch (error) {
      console.error('Failed to load job postings count:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'graduationYear' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Prepare update data based on role
      const updates: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || undefined,
      };

      if (user.role === 'STUDENT') {
        updates.graduationYear = formData.graduationYear;
      } else if (user.role === 'COMPANY_REP') {
        updates.companyName = formData.companyName;
        updates.jobTitle = formData.jobTitle;
        updates.industry = formData.industry;
      }

      await GraphQLService.updateUserProfile(user.email, updates);
      
      // Update local storage
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        graduationYear: user.graduationYear,
        companyName: user.companyName || '',
        jobTitle: user.jobTitle || '',
        industry: user.industry || '',
      });
    }
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="profile-container">
          <div className="profile-content">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-header">
            <h1>My Profile</h1>
            {!isEditing && (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                  <h2>Personal Information</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="disabled-input"
                    />
                    <small className="field-note">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      disabled={loading}
                    />
                  </div>
                </div>

                {user.role === 'STUDENT' && (
                  <div className="form-section">
                    <h2>Student Information</h2>
                    
                    <div className="form-group">
                      <label htmlFor="graduationYear">Graduation Year *</label>
                      <input
                        type="number"
                        id="graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear || ''}
                        onChange={handleInputChange}
                        min="2020"
                        max="2030"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {user.role === 'COMPANY_REP' && (
                  <div className="form-section">
                    <h2>Company Information</h2>
                    
                    <div className="form-group">
                      <label htmlFor="companyName">Company Name *</label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="jobTitle">Job Title *</label>
                      <input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-view">
                <div className="profile-section">
                  <h2>Personal Information</h2>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <p>{user.firstName} {user.lastName}</p>
                    </div>

                    <div className="info-item">
                      <label>Email</label>
                      <p>{user.email}</p>
                    </div>

                    <div className="info-item">
                      <label>Phone Number</label>
                      <p>{user.phoneNumber || 'Not provided'}</p>
                    </div>

                    <div className="info-item">
                      <label>Role</label>
                      <p className="role-badge">
                        {user.role === 'STUDENT' && 'Student'}
                        {user.role === 'COMPANY_REP' && 'Company Representative'}
                        {user.role === 'ADMIN' && 'Administrator'}
                      </p>
                    </div>
                  </div>
                </div>

                {user.role === 'STUDENT' && (
                  <div className="profile-section">
                    <h2>Student Information</h2>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Graduation Year</label>
                        <p>{user.graduationYear || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === 'COMPANY_REP' && (
                  <div className="profile-section">
                    <h2>Company Information</h2>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Company Name</label>
                        <p>{user.companyName || 'Not provided'}</p>
                      </div>

                      <div className="info-item">
                        <label>Job Title</label>
                        <p>{user.jobTitle || 'Not provided'}</p>
                      </div>

                      <div className="info-item">
                        <label>Industry</label>
                        <p>{user.industry || 'Not provided'}</p>
                      </div>

                      <div className="info-item">
                        <label>Posted Jobs</label>
                        <p className="stat-value">{jobPostingsCount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;
