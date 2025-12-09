import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import "./UsersRolesPage.css";
import { GraphQLService } from "../services/graphqlService";
import { User } from "../types";

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

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userList = await GraphQLService.listAllUsers();
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

  // Filtering logic
  useEffect(() => {
    let filtered = users;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  return (
    <>
      <Navigation />

      <div className="dashboard-container">
        <h1 className="page-title">Users & Roles</h1>

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
              <div className="filters-section">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="role-filter"
                >
                  <option value="all">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="COMPANY_REP">Company Rep</option>
                  <option value="UGA_FACULTY">UGA Faculty</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                          No users found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.email}>
                          <td>{u.email}</td>
                          <td>{u.firstName}</td>
                          <td>{u.lastName}</td>
                          <td>{u.role}</td>
                        </tr>
                      ))
                    )}
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
