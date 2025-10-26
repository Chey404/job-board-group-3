import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import "./AdminDashboard.css";

import {
  listJobsAdmin,
  updateJobStatusAdmin,
  deleteJobAdmin,
  listUsersAdmin,
  updateUserRoleAdmin,
  getPlatformSettings,
  updatePlatformSettings,
  type AdminJob,
  type AdminUser,
  type PlatformSettings,
} from "../services/adminService";

type Filters = {
  search?: string;
  company?: string;
  creator?: string;
  status?: "ALL" | "PENDING" | "ACTIVE" | "ARCHIVED";
  fromDate?: string;
  toDate?: string;
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  const [filters, setFilters] = useState<Filters>({ status: "ACTIVE" });
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sortBy, setSortBy] = useState<keyof AdminJob>("postedDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [settings, setSettings] = useState<PlatformSettings>({
    approvalRequired: true,
    postingExpirationDays: 60,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [jobList, userList, platform] = await Promise.all([
      listJobsAdmin(filters),
      listUsersAdmin(),
      getPlatformSettings().catch(() => ({
        approvalRequired: true,
        postingExpirationDays: 60,
      })),
    ]);
    setJobs(jobList);
    setUsers(userList);
    setSettings(platform);
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
    await updateJobStatusAdmin(id, "ACTIVE");
    await refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this posting?")) return;
    await deleteJobAdmin(id);
    await refresh();
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    await updatePlatformSettings(settings);
    setSavingSettings(false);
    alert("Settings saved");
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
              <option value="ACTIVE">Active</option>
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
          <h2 className="section-title">Postings</h2>
          {loading ? (
            <p className="muted">Loading…</p>
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
                    {sorted.length === 0 && (
                      <tr><td colSpan={7} className="muted">No results.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Users & Roles */}
        <section className="section">
          <h2 className="section-title">Users & Roles</h2>
          <div className="table-card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name ?? "-"}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={async (e) => {
                            await updateUserRoleAdmin(u.id, e.target.value as AdminUser["role"]);
                            await refresh();
                          }}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="COMPANY">Company</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="muted">No users.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Platform Settings */}
        <section className="section">
          <h2 className="section-title">Platform Settings</h2>
          <div className="settings-form">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={settings.approvalRequired}
                onChange={(e) => setSettings((s) => ({ ...s, approvalRequired: e.target.checked }))}
              />
              <span>Require admin approval before postings go live</span>
            </label>

            <label className="number">
              <span>Default expiration (days)</span>
              <input
                type="number"
                min={1}
                value={settings.postingExpirationDays}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, postingExpirationDays: parseInt(e.target.value || "60", 10) }))
                }
              />
            </label>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
