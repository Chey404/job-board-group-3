import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { DataService } from '../services/dataService';
import { JobPosting } from '../types';
import './MetricsPage.css';

interface JobStatusCount {
  status: string;
  count: number;
  color: string;
}

interface JobViewStats {
  id: string;
  title: string;
  company: string;
  viewCount: number;
  applicationCount: number;
  status: string;
}

export default function MetricsPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobStatusData, setJobStatusData] = useState<JobStatusCount[]>([]);
  const [topViewedJobs, setTopViewedJobs] = useState<JobViewStats[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/signin');
  }, [user, navigate]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const allJobs = await DataService.listAllJobs();
      setJobs(allJobs);

      // Calculate job status distribution
      const statusCounts: Record<string, number> = {
        DRAFT: 0,
        PENDING: 0,
        APPROVED: 0,
        ARCHIVED: 0,
      };

      allJobs.forEach((job) => {
        if (job.status in statusCounts) {
          statusCounts[job.status]++;
        }
      });

      const statusColors: Record<string, string> = {
        DRAFT: '#9ca3af',
        PENDING: '#f59e0b',
        APPROVED: '#10b981',
        ARCHIVED: '#6b7280',
      };

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        color: statusColors[status],
      }));

      setJobStatusData(statusData);

      // Get top viewed jobs
      const sortedByViews = [...allJobs]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 10)
        .map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          viewCount: job.viewCount || 0,
          applicationCount: job.applicationCount || 0,
          status: job.status,
        }));

      setTopViewedJobs(sortedByViews);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === 'APPROVED').length;
  const pendingJobs = jobs.filter((job) => job.status === 'PENDING').length;
  const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0);
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

  const maxStatusCount = Math.max(...jobStatusData.map((s) => s.count), 1);

  return (
    <>
      <Navigation />
      <div className="metrics-container">
        <h1 className="page-title">Metrics & Analytics</h1>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading metrics...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <section className="metrics-section">
              <h2 className="section-title">Overview</h2>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: '#3b82f6' }}>
                    📊
                  </div>
                  <div className="metric-content">
                    <div className="metric-label">Total Jobs</div>
                    <div className="metric-value">{totalJobs}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: '#10b981' }}>
                    ✓
                  </div>
                  <div className="metric-content">
                    <div className="metric-label">Active Jobs</div>
                    <div className="metric-value">{activeJobs}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: '#f59e0b' }}>
                    ⏱
                  </div>
                  <div className="metric-content">
                    <div className="metric-label">Pending Approval</div>
                    <div className="metric-value">{pendingJobs}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: '#8b5cf6' }}>
                    👁
                  </div>
                  <div className="metric-content">
                    <div className="metric-label">Total Views</div>
                    <div className="metric-value">{totalViews}</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: '#ec4899' }}>
                    📝
                  </div>
                  <div className="metric-content">
                    <div className="metric-label">Total Applications</div>
                    <div className="metric-value">{totalApplications}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Job Status Distribution */}
            <section className="metrics-section">
              <h2 className="section-title">Job Status Distribution</h2>
              <div className="chart-container">
                <div className="bar-chart">
                  {jobStatusData.map((item) => (
                    <div key={item.status} className="bar-item">
                      <div className="bar-label">{item.status}</div>
                      <div className="bar-wrapper">
                        <div
                          className="bar"
                          style={{
                            width: `${(item.count / maxStatusCount) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        >
                          <span className="bar-value">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Top Viewed Jobs Table */}
            <section className="metrics-section">
              <h2 className="section-title">Top Viewed Job Listings</h2>
              <div className="table-card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Applications</th>
                        <th>Engagement Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topViewedJobs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="empty-cell">
                            No job data available
                          </td>
                        </tr>
                      ) : (
                        topViewedJobs.map((job, index) => {
                          const engagementRate =
                            job.viewCount > 0
                              ? ((job.applicationCount / job.viewCount) * 100).toFixed(1)
                              : '0.0';
                          return (
                            <tr key={job.id}>
                              <td className="rank-cell">#{index + 1}</td>
                              <td>
                                <a
                                  href={`/job/${job.id}`}
                                  className="job-link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/job/${job.id}`);
                                  }}
                                >
                                  {job.title}
                                </a>
                              </td>
                              <td>{job.company}</td>
                              <td>
                                <span className={`status-badge status-${job.status.toLowerCase()}`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="number-cell">{job.viewCount}</td>
                              <td className="number-cell">{job.applicationCount}</td>
                              <td className="number-cell">{engagementRate}%</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Future: User Login Activity Section */}
            <section className="metrics-section">
              <h2 className="section-title">User Activity</h2>
              <div className="info-card">
                <p className="info-text">
                  User login activity tracking coming soon. This will show login patterns,
                  active users, and engagement metrics.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
