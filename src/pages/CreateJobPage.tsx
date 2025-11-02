import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { GraphQLService } from '../services/graphqlService';
import './CreateJobPage.css';

interface FormData {
  title: string;
  company: string;
  industry: string;
  type: string;
  description: string;
  responsibilities: string;
  requiredSkills: string;
  deadline: string;
  contactMethod: string;
  contactValue: string;
}

interface FormErrors {
  title?: string;
  company?: string;
  industry?: string;
  type?: string;
  description?: string;
  responsibilities?: string;
  requiredSkills?: string;
  deadline?: string;
  contactMethod?: string;
  contactValue?: string;
}

const mapJobType = (type: string): 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT' => {
  switch (type) {
    case 'internship':
      return 'INTERNSHIP';
    case 'full-time':
      return 'FULL_TIME';
    case 'contract':
      return 'CONTRACT';
    default:
      return 'INTERNSHIP';
  }
};

const CreateJobPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    company: '',
    industry: '',
    type: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    deadline: '',
    contactMethod: '',
    contactValue: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const jobTypes = [
    { value: '', label: 'Select Job Type' },
    { value: 'internship', label: 'Internship' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'contract', label: 'Contract' }
  ];

  const industries = [
    { value: '', label: 'Select Industry' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
    { value: 'Research & Development', label: 'Research & Development' },
    { value: 'Design & Creative', label: 'Design & Creative' },
    { value: 'Finance & Banking', label: 'Finance & Banking' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' }
  ];

  const contactMethods = [
    { value: '', label: 'Select Contact Method' },
    { value: 'email', label: 'Email' },
    { value: 'careers_page', label: 'Company Careers Page' }
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Job title is required';
        if (value.trim().length < 3) return 'Job title must be at least 3 characters';
        return '';
      
      case 'company':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Company name must be at least 2 characters';
        return '';
      
      case 'industry':
        if (!value) return 'Industry selection is required';
        return '';
      
      case 'type':
        if (!value) return 'Job type selection is required';
        return '';
      
      case 'description':
        if (!value.trim()) return 'Job description is required';
        if (value.trim().length < 50) return 'Job description must be at least 50 characters';
        return '';
      
      case 'responsibilities':
        if (!value.trim()) return 'Key responsibilities are required';
        if (value.trim().length < 10) return 'Key responsibilities must be at least 10 characters';
        return '';
      
      case 'requiredSkills':
        if (!value.trim()) return 'Required skills are required';
        if (value.trim().length < 5) return 'Required skills must be at least 5 characters';
        return '';
      
      case 'deadline': {
        if (!value) return 'Application deadline is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) return 'Deadline must be in the future';
        return '';
      }
      
      case 'contactMethod':
        if (!value) return 'Contact method is required';
        return '';
      
      case 'contactValue': {
        if (!value.trim()) return 'Contact information is required';
        if (formData.contactMethod === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Please enter a valid email address';
        } else if (formData.contactMethod === 'careers_page') {
          const urlRegex = /^https?:\/\/.+\..+/;
          if (!urlRegex.test(value)) return 'Please enter a valid URL (starting with http:// or https://)';
        }
        return '';
      }
      
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate the field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  useEffect(() => {
    const checkFormValidity = () => {
      const requiredFields = ['title', 'company', 'industry', 'type', 'description', 'responsibilities', 'requiredSkills', 'deadline', 'contactMethod', 'contactValue'];
      
      const hasAllFields = requiredFields.every(field => {
        const value = formData[field as keyof FormData];
        return value && value.toString().trim() !== '';
      });
      
      const hasNoErrors = Object.values(errors).every(error => !error);
      
      setIsFormValid(hasAllFields && hasNoErrors);
    };

    checkFormValidity();
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse skills from textarea (split by commas or newlines)
      const skillsArray = formData.requiredSkills
        .split(/[,\n]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      // Create job posting
      const jobData = {
        title: formData.title,
        company: formData.company,
        industry: formData.industry,
        jobType: mapJobType(formData.type),
        description: `${formData.description}\n\nKey Responsibilities:\n${formData.responsibilities}`,
        skills: skillsArray,
        deadline: new Date(formData.deadline).toISOString(),
        contactMethod: {
          type: formData.contactMethod.toUpperCase() as 'EMAIL' | 'CAREERS_PAGE',
          value: formData.contactValue
        },
        postedBy: user.email,
        status: 'APPROVED' as const // Auto-approve for now
      };

      await GraphQLService.createJob(jobData);
      
      // Show success message
      alert('Job posting created successfully and is now live!');
      
      // Navigate back to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('Error creating job posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-job-container">
      <Navigation />
      
      <main className="create-job-main">
        <div className="create-job-content">
          <div className="page-header">
            <h1>Create a Job Posting</h1>
            <p>Post a new opportunity for students</p>
          </div>

          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'error' : ''}
                    placeholder="e.g., Software Engineering Intern"
                  />
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company *</label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={errors.company ? 'error' : ''}
                    placeholder="e.g., TechCorp Solutions"
                  />
                  {errors.company && <span className="error-text">{errors.company}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="industry">Industry *</label>
                  <select
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className={errors.industry ? 'error' : ''}
                  >
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                  {errors.industry && <span className="error-text">{errors.industry}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="type">Job Type *</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={errors.type ? 'error' : ''}
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && <span className="error-text">{errors.type}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Job Details</h2>
              
              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'error' : ''}
                  placeholder="Provide a detailed description of the job role, company culture, and what the candidate can expect..."
                  rows={4}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="responsibilities">Key Responsibilities *</label>
                <textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  className={errors.responsibilities ? 'error' : ''}
                  placeholder="List the main responsibilities and duties for this position..."
                  rows={4}
                />
                {errors.responsibilities && <span className="error-text">{errors.responsibilities}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="requiredSkills">Required Skills/Qualifications *</label>
                <textarea
                  id="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={(e) => handleInputChange('requiredSkills', e.target.value)}
                  className={errors.requiredSkills ? 'error' : ''}
                  placeholder="JavaScript, React, Node.js, Problem Solving, Communication"
                  rows={3}
                />
                <small className="field-hint">
                  💡 Separate each skill with a comma or put each skill on a new line. These will appear as individual skill tags on the job card.
                </small>
                {formData.requiredSkills && (
                  <div className="skills-preview">
                    <small className="preview-label">Preview:</small>
                    <div className="skills-preview-tags">
                      {formData.requiredSkills
                        .split(/[,\n]/)
                        .map(skill => skill.trim())
                        .filter(skill => skill.length > 0)
                        .slice(0, 6)
                        .map((skill, index) => (
                          <span key={index} className="skill-preview-tag">
                            {skill}
                          </span>
                        ))}
                      {formData.requiredSkills.split(/[,\n]/).filter(s => s.trim().length > 0).length > 6 && (
                        <span className="skill-preview-tag more">
                          +{formData.requiredSkills.split(/[,\n]/).filter(s => s.trim().length > 0).length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {errors.requiredSkills && <span className="error-text">{errors.requiredSkills}</span>}
              </div>
            </div>

            <div className="form-section">
              <h2>Application Details</h2>
              
              <div className="form-group">
                <label htmlFor="deadline">Application Deadline *</label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={errors.deadline ? 'error' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deadline && <span className="error-text">{errors.deadline}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactMethod">Contact/Application Method *</label>
                  <select
                    id="contactMethod"
                    value={formData.contactMethod}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className={errors.contactMethod ? 'error' : ''}
                  >
                    {contactMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                  {errors.contactMethod && <span className="error-text">{errors.contactMethod}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="contactValue">
                    {formData.contactMethod === 'email' ? 'Email Address' :
                     formData.contactMethod === 'careers_page' ? 'Careers Page URL' : 'Contact Information'} *
                  </label>
                  <input
                    type={formData.contactMethod === 'email' ? 'email' : 
                          formData.contactMethod === 'careers_page' ? 'url' : 'text'}
                    id="contactValue"
                    value={formData.contactValue}
                    onChange={(e) => handleInputChange('contactValue', e.target.value)}
                    className={errors.contactValue ? 'error' : ''}
                    placeholder={
                      formData.contactMethod === 'email' ? 'recruiter@company.com' :
                      formData.contactMethod === 'careers_page' ? 'https://company.com/careers' : 'Enter contact information'
                    }
                  />
                  {errors.contactValue && <span className="error-text">{errors.contactValue}</span>}
                </div>
              </div>


            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Creating Job Posting...' : 'Create Job Posting'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateJobPage;