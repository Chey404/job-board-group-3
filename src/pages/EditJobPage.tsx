import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getJobAdmin, updateJobAdmin, deleteJobAdmin, type AdminJobInput } from "../services/adminService";
import Navigation from "../components/Navigation";
import "./EditJobPage.css";

export default function EditJobPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState<AdminJobInput | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const j = await getJobAdmin(id);
      setForm({
        id: j.id,
        title: j.title ?? "",
        companyName: j.companyName ?? "",
        description: j.description ?? "",
        postedDate: j.postedDate ?? new Date().toISOString(),
        reviewedDate: j.reviewedDate ?? null,
        expirationDate: j.expirationDate ?? null,
        status: j.status,
      });
    })();
  }, [id]);

  if (!form) return <p>Loading…</p>;

  const save = async () => {
    setSaving(true);
    await updateJobAdmin(form);
    setSaving(false);
    alert("Saved");
    navigate("/admin");
  };

  return (
       <>
      <Navigation />

      <div className="dashboard-container">
        <div className="dashboard-main">
          <h1 className="page-title">Edit Job</h1>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading…</p>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-grid">
                {/* Title */}
                <div className="full">
                  <label htmlFor="title">Job Title</label>
                  <input
                    id="title"
                    type="text"
                    value={job.title ?? ""}
                    onChange={(e) => setJob((j: any) => ({ ...j, title: e.target.value }))}
                  />
                </div>

                {/* Company */}
                <div className="full">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    value={job.companyName ?? ""}
                    onChange={(e) => setJob((j: any) => ({ ...j, companyName: e.target.value }))}
                  />
                </div>

                {/* Posted / Reviewed / Expiration */}
                <div>
                  <label htmlFor="postedDate">Posted Date</label>
                  <input
                    id="postedDate"
                    type="date"
                    value={(job.postedDate ?? "").slice(0, 10)}
                    onChange={(e) => setJob((j: any) => ({ ...j, postedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="reviewedDate">Reviewed Date</label>
                  <input
                    id="reviewedDate"
                    type="date"
                    value={(job.reviewedDate ?? "").slice(0, 10)}
                    onChange={(e) => setJob((j: any) => ({ ...j, reviewedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="expirationDate">Expiration Date</label>
                  <input
                    id="expirationDate"
                    type="date"
                    value={(job.expirationDate ?? "").slice(0, 10)}
                    onChange={(e) => setJob((j: any) => ({ ...j, expirationDate: e.target.value }))}
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={job.status ?? "PENDING"}
                    onChange={(e) => setJob((j: any) => ({ ...j, status: e.target.value }))}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                {/* Description */}
                <div className="full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={job.description ?? ""}
                    onChange={(e) => setJob((j: any) => ({ ...j, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={save}>Save</button>
                <button className="btn" onClick={() => navigate("/admin")}>Cancel</button>
                <button className="btn btn-danger" onClick={remove}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
