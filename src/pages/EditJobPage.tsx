import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getJobAdmin,  updateJobAdmin,  deleteJobAdmin,  type AdminJobInput, } from "../services/adminService";
import Navigation from "../components/Navigation";
import "./EditJobPage.css";

export default function EditJobPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<AdminJobInput | null>(null);
  const [saving, setSaving] = useState(false);

  // Gate non-admins
  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  // Load job
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
        status: j.status ?? "PENDING",
      });
    })();
  }, [id]);

  // Loading UI
  if (!form) {
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

  const save = async () => {
    setSaving(true);
    await updateJobAdmin(form);
    setSaving(false);
    alert("Saved");
    navigate("/admin");
  };

  const remove = async () => {
    if (!form?.id) return;
    if (!confirm("Delete this posting?")) return;
    setSaving(true);
    await deleteJobAdmin(form.id);
    setSaving(false);
    alert("Deleted");
    navigate("/admin");
  };

  return (
    <>
      <Navigation />

      <div className="dashboard-container">
        <div className="dashboard-main">
          <h1 className="page-title">Edit Job</h1>

          <div className="form-card">
            <div className="form-grid">
              {/* Title */}
              <div className="full">
                <label htmlFor="title">Job Title</label>
                <input
                  id="title"
                  type="text"
                  value={form.title ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...(f as AdminJobInput), title: e.target.value }))
                  }
                />
              </div>

              {/* Company */}
              <div className="full">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={form.companyName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...(f as AdminJobInput), companyName: e.target.value }))
                  }
                />
              </div>

              {/* Dates */}
              <div>
                <label htmlFor="postedDate">Posted Date</label>
                <input
                  id="postedDate"
                  type="date"
                  value={(form.postedDate ?? "").slice(0, 10)}
                  onChange={(e) =>
                    setForm((f) => ({ ...(f as AdminJobInput), postedDate: e.target.value }))
                  }
                />
              </div>

              <div>
                <label htmlFor="reviewedDate">Reviewed Date</label>
                <input
                  id="reviewedDate"
                  type="date"
                  value={(form.reviewedDate ?? "").slice(0, 10)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...(f as AdminJobInput),
                      reviewedDate: e.target.value || null,
                    }))
                  }
                />
              </div>

              <div>
                <label htmlFor="expirationDate">Expiration Date</label>
                <input
                  id="expirationDate"
                  type="date"
                  value={(form.expirationDate ?? "").slice(0, 10)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...(f as AdminJobInput),
                      expirationDate: e.target.value || null,
                    }))
                  }
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status ?? "PENDING"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...(f as AdminJobInput),
                      status: e.target.value as AdminJobInput["status"],
                    }))
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Description */}
              <div className="full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...(f as AdminJobInput), description: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn" onClick={() => navigate("/admin")} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={remove} disabled={saving}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
