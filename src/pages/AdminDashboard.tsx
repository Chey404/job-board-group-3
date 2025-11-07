import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import "./AdminDashboard.css";

import {
  listJobsAdmin,
  updateJobStatusAdmin,
  deleteJobAdmin,
  type AdminJob,
} from "../services/adminService";

type Filters = {
  search?: string;
  company?: string;
  creator?: string;
  status?: "ALL" | "PENDING" | "APPROVED" | "ARCHIVED";
  fromDate?: string;
  toDate?: string;
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  const [filters, setFilters] = useState<Filters>({ status: "ALL" });
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [sortBy, setSortBy] = useState<keyof AdminJob>("postedDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const refresh = async () => {
    setLoading(true);
    const jobList = await listJobsAdmin(filters);
    setJobs(jobList);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const sorted = useMemo(() => {
    const copy = [...jobs];
    copy.sort((a, b) => {
      const A = (a[sortBy] ?? "") as any;
      const B = (b[sortBy] ?? "") as any;
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [jobs, sortBy, sortDir]);

  const toggleSort = (key: keyof AdminJob) => {
    if (key === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const archive = async (id: string) => {
    await updateJobStatusAdmin(id, "ARCHIVED");
    await refresh();
  };
  const approve = async (id: string) => {
    await updateJobStatusAdmin(id, "APPROVED");
    await refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this posting?")) return;
    await deleteJobAdmin(id);
    await refresh();
  };

  return (
    <>
      {/* Shared top bar (includes Logout) */}
      <Navigation />

      <div className="dashboard-container">
        <h1 className="page-title">Admin Dashboard</h1>

        {/* Filters */}
        <section className="section">
          <div className="filters-grid">
            <input
              placeholder="Search title…"
              value={filters.search ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <input
              placeholder="Company"
              value={filters.company ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))}
            />
            <input
              placeholder="Creator"
              value={filters.creator ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, creator: e.target.value }))}
            />
            <select
              value={filters.status ?? "ALL"}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <input
              type="date"
              value={filters.fromDate ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))}
            />
            <input
              type="date"
              value={filters.toDate ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))}
            />
            <button className="btn btn-primary" onClick={refresh} disabled={loading}>
              Apply
            </button>
          </div>
        </section>

        {/* Jobs table */}
        <section className="section">
          <h2 className="section-title">Job Postings</h2>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading job postings...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="empty-state">
              <h3>No Job Postings Found</h3>
              <p>Try adjusting your filters or create a new job posting.</p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("title")}>Job Title</th>
                      <th onClick={() => toggleSort("companyName")}>Company Name</th>
                      <th onClick={() => toggleSort("postedDate")}>Posted Date</th>
                      <th onClick={() => toggleSort("reviewedDate")}>Reviewed Date</th>
                      <th onClick={() => toggleSort("expirationDate")}>Expiration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((j) => (
                      <tr key={j.id}>
                        <td><Link to={`/admin/jobs/${j.id}`}>{j.title}</Link></td>
                        <td>{j.companyName}</td>
                        <td>{j.postedDate?.slice(0, 10) ?? "-"}</td>
                        <td>{j.reviewedDate?.slice(0, 10) ?? "-"}</td>
                        <td>{j.expirationDate?.slice(0, 10) ?? "-"}</td>
                        <td>{j.status}</td>
                        <td className="actions">
                          {j.status !== "ARCHIVED" && (
                            <button className="btn btn-warning" onClick={() => archive(j.id)}>Archive</button>
                          )}
                          {j.status === "PENDING" && (
                            <button className="btn btn-success" onClick={() => approve(j.id)}>Approve</button>
                          )}
                          <button className="btn" onClick={() => navigate(`/admin/jobs/${j.id}`)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => remove(j.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
