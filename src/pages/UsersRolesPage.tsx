import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import "./UsersRolesPage.css";

import {
  listUsersAdmin,
  updateUserRoleAdmin,
  type AdminUser,
} from "../services/adminService";

export default function UsersRolesPage() {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/signin");
  }, [user, navigate]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userList = await listUsersAdmin();
      setUsers(userList);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: AdminUser["role"]) => {
    setFeedback(null);
    try {
      await updateUserRoleAdmin(userId, newRole);
      setFeedback({ type: "success", message: "Role updated successfully" });
      // Refresh user list
      await loadUsers();
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to update role. Please try again." });
      console.error("Error updating role:", err);
    }
  };

  return (
    <>
      <Navigation />

      <div className="dashboard-container">
        <h1 className="page-title">Users & Roles</h1>

        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <section className="section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Error Loading Users</h3>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadUsers}>
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <h3>No Users Found</h3>
              <p>There are currently no registered users in the system.</p>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name || "—"}</td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as AdminUser["role"])}
                            className="role-selector"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="COMPANY">COMPANY</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
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
