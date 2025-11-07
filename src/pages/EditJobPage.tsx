import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { GraphQLService } from "../services/graphqlService";
import { JobPosting, ContactMethod } from "../types";
import Navigation from "../components/Navigation";
import "./EditJobPage.css";

export default function EditJobPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState<JobPosting | null>(null);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Gate non-admins
  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  // Load job
  useEffect(() => {
    (async () => {
      if (!id) return;
      const job = await GraphQLService.getJobById(id);
      if (job) {
        setFormData(job);
      }
    })();
  }, [id]);

  // Loading UI
  if (!formData) {
    return (
      <>
        <Navigation />
        <div className="dashboard-container">
          <div className="dashboard-main">
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleContactMethodChange = (field: 'type' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev!,
      contactMethod: {
        ...prev!.contactMethod,
        [field]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev!,
        skills: [...prev!.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev!,
      skills: prev!.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await GraphQLService.updateJob(formData.id, formData);
      alert("Job updated successfully");
      navigate("/admin");
    } catch (err) {
      alert("Failed to update job. Please try again.");
      console.error("Error updating job:", err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!formData?.id) return;
    if (!confirm("Delete this posting?")) return;
    setSaving(true);
    try {
      await GraphQLService.deleteJob(formData.id);
      alert("Job deleted successfully");
      navigate("/admin");
    } catch (err) {
      alert("Failed to delete job. Please try again.");
      console.error("Error deleting job:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navigation />

      <div className="dashboard-container">
        <div className="dashboard-main">
          <h1 className="page-title">Edit Job</h1>

          <div className="form-card">
            <form onSubmit={(e) => { e.preventDefault(); save(); }} className="edit-job-form">
              {/* Job Title */}
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

              {/* Company and Industry */}
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

              {/* Job Type and Deadline */}
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

              {/* Status (Admin only) */}
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Description */}
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

              {/* Skills */}
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

              {/* Contact Method */}
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

              {/* Form Actions */}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="btn" onClick={() => navigate("/admin")} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={remove} disabled={saving}>
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
