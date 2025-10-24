import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getJobAdmin, updateJobAdmin, type AdminJobInput } from "../services/adminService";

export default function EditJobPage() {
  const { user } = useContext(AuthContext);
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
    <div className="container" style={{ padding: "1rem 1.5rem" }}>
      <h1>Edit Posting</h1>
      <div style={{ display: "grid", gap: ".75rem", maxWidth: 720 }}>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Job Title" />
        <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Company Name" />
        <textarea rows={8} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
        <label>Posted Date
          <input type="date" value={(form.postedDate ?? "").slice(0,10)}
                 onChange={(e) => setForm({ ...form, postedDate: new Date(e.target.value).toISOString() })} />
        </label>
        <label>Reviewed Date
          <input type="date" value={(form.reviewedDate ?? "").slice(0,10)}
                 onChange={(e) => setForm({ ...form, reviewedDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </label>
        <label>Expiration Date
          <input type="date" value={(form.expirationDate ?? "").slice(0,10)}
                 onChange={(e) => setForm({ ...form, expirationDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </label>
        <label>Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}
