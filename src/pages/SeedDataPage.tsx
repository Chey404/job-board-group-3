import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { seedJobPostings, seedJobPostingsLimit, mockJobPostings } from '../utils/seedData';
import './SeedDataPage.css';

export default function SeedDataPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ successCount: number; errorCount: number } | null>(null);
  const [customLimit, setCustomLimit] = useState(5);

  if (!user || user.role !== 'ADMIN') {
    navigate('/signin');
    return null;
  }

  const handleSeedAll = async () => {
    if (!confirm(`This will create ${mockJobPostings.length} job postings. Continue?`)) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const seedResult = await seedJobPostings();
      setResult(seedResult);
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('An error occurred while seeding data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLimited = async () => {
    if (customLimit < 1 || customLimit > mockJobPostings.length) {
      alert(`Please enter a number between 1 and ${mockJobPostings.length}`);
      return;
    }

    if (!confirm(`This will create ${customLimit} job postings. Continue?`)) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const seedResult = await seedJobPostingsLimit(customLimit);
      setResult(seedResult);
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('An error occurred while seeding data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="seed-data-container">
        <h1 className="page-title">Database Seed Utility</h1>

        <div className="warning-card">
          <div className="warning-icon">⚠️</div>
          <div>
            <h3>Developer Tool</h3>
            <p>
              This page is for development and testing purposes only. Use it to populate your
              database with mock job postings.
            </p>
          </div>
        </div>

        <section className="seed-section">
          <h2 className="section-title">Available Mock Data</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Total Jobs Available:</span>
              <span className="info-value">{mockJobPostings.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Job Types:</span>
              <span className="info-value">Internship, Full-Time</span>
            </div>
            <div className="info-item">
              <span className="info-label">Industries:</span>
              <span className="info-value">
                Software, Data & Analytics, Technology, Cybersecurity, Engineering, Marketing,
                Sales, Finance, HR, Supply Chain
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value">All set to APPROVED</span>
            </div>
          </div>
        </section>

        <section className="seed-section">
          <h2 className="section-title">Seed Options</h2>

          <div className="seed-options">
            <div className="seed-card">
              <h3>Seed All Jobs</h3>
              <p>Create all {mockJobPostings.length} job postings in the database.</p>
              <button
                className="btn btn-primary btn-large"
                onClick={handleSeedAll}
                disabled={loading}
              >
                {loading ? 'Seeding...' : `Seed All ${mockJobPostings.length} Jobs`}
              </button>
            </div>

            <div className="seed-card">
              <h3>Seed Limited Number</h3>
              <p>Create a specific number of job postings for testing.</p>
              <div className="limit-controls">
                <input
                  type="number"
                  min="1"
                  max={mockJobPostings.length}
                  value={customLimit}
                  onChange={(e) => setCustomLimit(parseInt(e.target.value) || 1)}
                  className="limit-input"
                  disabled={loading}
                />
                <button
                  className="btn btn-secondary btn-large"
                  onClick={handleSeedLimited}
                  disabled={loading}
                >
                  {loading ? 'Seeding...' : `Seed ${customLimit} Jobs`}
                </button>
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Creating job postings...</p>
          </div>
        )}

        {result && (
          <section className="seed-section">
            <h2 className="section-title">Results</h2>
            <div className="result-card">
              <div className="result-item success">
                <span className="result-icon">✓</span>
                <div>
                  <div className="result-label">Successfully Created</div>
                  <div className="result-value">{result.successCount} jobs</div>
                </div>
              </div>
              {result.errorCount > 0 && (
                <div className="result-item error">
                  <span className="result-icon">✗</span>
                  <div>
                    <div className="result-label">Failed</div>
                    <div className="result-value">{result.errorCount} jobs</div>
                  </div>
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin')}
                style={{ marginTop: '1rem' }}
              >
                View Job Postings
              </button>
            </div>
          </section>
        )}

        <section className="seed-section">
          <h2 className="section-title">Preview Data</h2>
          <div className="preview-table">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Type</th>
                  <th>Skills</th>
                </tr>
              </thead>
              <tbody>
                {mockJobPostings.slice(0, 10).map((job, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.industry}</td>
                    <td>
                      <span className={`badge badge-${job.jobType.toLowerCase()}`}>
                        {job.jobType}
                      </span>
                    </td>
                    <td className="skills-cell">{job.skills.slice(0, 3).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mockJobPostings.length > 10 && (
              <p className="preview-note">
                Showing 10 of {mockJobPostings.length} jobs
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
