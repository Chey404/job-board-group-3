import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import {
  isMockDataEnabled,
  setMockDataEnabled,
  resetMockData,
  getMockJobs,
  initialMockJobs
} from '../services/mockDataService';
import './MockDataTogglePage.css';

export default function MockDataTogglePage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [mockEnabled, setMockEnabled] = useState(isMockDataEnabled());
  const [mockJobCount, setMockJobCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/signin');
      return;
    }
    setMockJobCount(getMockJobs().length);
  }, [user, navigate]);

  const handleToggle = () => {
    const newValue = !mockEnabled;
    setMockDataEnabled(newValue);
    setMockEnabled(newValue);
    setMockJobCount(getMockJobs().length);

    // Reload to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleReset = () => {
    if (!confirm('This will reset all mock data to the initial 20 job postings. Continue?')) {
      return;
    }
    resetMockData();
    setMockJobCount(getMockJobs().length);
    alert('Mock data has been reset!');
  };

  return (
    <>
      <Navigation />
      <div className="mock-toggle-container">
        <h1 className="page-title">Mock Data Settings</h1>

        <div className="warning-card">
          <div className="warning-icon">🔧</div>
          <div>
            <h3>Development Tool</h3>
            <p>
              Use mock data mode for local development and testing without connecting to AWS
              Amplify. All data is stored in your browser's localStorage.
            </p>
          </div>
        </div>

        <section className="settings-section">
          <h2 className="section-title">Data Source</h2>
          <div className="toggle-card">
            <div className="toggle-info">
              <h3>{mockEnabled ? '📦 Mock Data Mode' : '☁️ Live Amplify Data'}</h3>
              <p>
                {mockEnabled
                  ? 'Using local mock data stored in browser localStorage. No connection to AWS.'
                  : 'Connected to AWS Amplify backend with real database.'}
              </p>
            </div>
            <button
              className={`toggle-button ${mockEnabled ? 'active' : ''}`}
              onClick={handleToggle}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </section>

        {mockEnabled && (
          <>
            <section className="settings-section">
              <h2 className="section-title">Mock Data Status</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Mock Jobs in Storage</div>
                  <div className="stat-value">{mockJobCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Initial Jobs Available</div>
                  <div className="stat-value">{initialMockJobs.length}</div>
                </div>
              </div>
            </section>

            <section className="settings-section">
              <h2 className="section-title">Actions</h2>
              <div className="actions-grid">
                <div className="action-card">
                  <h3>Reset to Initial Data</h3>
                  <p>Reset all mock data back to the original 20 job postings.</p>
                  <button className="btn btn-warning" onClick={handleReset}>
                    Reset Mock Data
                  </button>
                </div>
                <div className="action-card">
                  <h3>View Jobs</h3>
                  <p>See all mock job postings in the admin dashboard.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/admin')}>
                    View Jobs
                  </button>
                </div>
              </div>
            </section>

            <section className="settings-section">
              <h2 className="section-title">What's Included</h2>
              <div className="info-grid-detailed">
                <div className="info-detail">
                  <strong>20 Job Postings</strong>
                  <p>Mix of full-time and internship positions</p>
                </div>
                <div className="info-detail">
                  <strong>10 Industries</strong>
                  <p>Software, Data & Analytics, Technology, Cybersecurity, Engineering, Marketing, Sales, Finance, HR, Supply Chain</p>
                </div>
                <div className="info-detail">
                  <strong>Realistic View Counts</strong>
                  <p>Each job has mock view and application statistics</p>
                </div>
                <div className="info-detail">
                  <strong>Various Statuses</strong>
                  <p>Includes APPROVED, PENDING, DRAFT, and ARCHIVED jobs</p>
                </div>
              </div>
            </section>
          </>
        )}

        {!mockEnabled && (
          <section className="settings-section">
            <div className="info-card">
              <h3>💡 When to Use Mock Data</h3>
              <ul>
                <li>Local development and testing</li>
                <li>When AWS Amplify is not configured</li>
                <li>To quickly populate test data</li>
                <li>When working offline</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
