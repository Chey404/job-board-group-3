import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navigation.css';

type Role = 'STUDENT' | 'COMPANY_REP' | 'ADMIN' | string;

type Tab = {
  id: string;
  label: string;
  route: string;   // for normal navigation; special actions handled by id
  roles: Role[];
};

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('job-board');

  // Build tabs based on role
  const tabs: Tab[] = useMemo(() => {
    const role = user?.role as Role;

    // STUDENT
    if (role === 'STUDENT') {
      return [
        { id: 'job-board',    label: 'DawgsConnect',       route: '/dashboard', roles: ['STUDENT'] },
        { id: 'applications', label: 'My Applications',    route: '/applications', roles: ['STUDENT'] },
        { id: 'profile',      label: 'My Profile',         route: '/profile', roles: ['STUDENT'] },
      ];
    }

    // COMPANY (future friendly)
    if (role === 'COMPANY_REP') {
      return [
        { id: 'job-board',  label: 'DawgsConnect',     route: '/dashboard', roles: ['COMPANY_REP'] },
        { id: 'my-jobs',    label: 'My Postings',      route: '/my-job-postings', roles: ['COMPANY_REP'] },
        { id: 'create-job', label: 'Create Job Post',  route: '/create-job', roles: ['COMPANY_REP'] },
        { id: 'profile',    label: 'Profile',          route: '/profile', roles: ['COMPANY_REP'] },
      ];
    }

    // ADMIN
    if (role === 'ADMIN') {
      return [
        { id: 'manage-jobs',  label: 'Manage Jobs',       route: '/admin', roles: ['ADMIN'] },
        { id: 'pending',      label: 'Pending Approvals', route: '/admin?status=PENDING', roles: ['ADMIN'] },
        { id: 'create-job',   label: 'Create Job Post',   route: '/create-job', roles: ['ADMIN'] },
        // Route to anchors so it won’t 404 if you don’t have separate pages yet
        { id: 'users',        label: 'Users & Roles',     route: '/admin#users', roles: ['ADMIN'] },
        { id: 'settings',     label: 'Platform Settings', route: '/admin#settings', roles: ['ADMIN'] },
        // Special quick-jump; handled by id in click handler (no direct route)
        { id: 'edit-by-id',   label: 'Edit by ID',        route: '/admin/jobs', roles: ['ADMIN'] },
      ];
    }

    // Default (unauth or unknown): minimal student-like
    return [
      { id: 'job-board', label: 'DawgsConnect', route: '/dashboard', roles: [role || 'STUDENT'] },
    ];
  }, [user?.role]);

// Active tab detection
  useEffect(() => {
    const pathname = location.pathname;
    const search = location.search;

    // Admin deep links
    if (pathname.startsWith('/admin/jobs/')) {
      setActiveTab('edit-by-id');
      return;
    }
    if (pathname === '/admin') {
      if (search.includes('status=PENDING')) setActiveTab('pending');
      else setActiveTab('manage-jobs');
      return;
    }

    // Common routes
    const map: Record<string, string> = {
      '/dashboard': 'job-board',
      '/create-job': 'create-job',
      '/my-job-postings': 'my-jobs',
      '/applications': 'applications',
      '/profile': 'profile',
    };

    const found = map[pathname];
    if (found) setActiveTab(found);
  }, [location.pathname, location.search]);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Admin quick-jump: Edit by ID
    if (tabId === 'edit-by-id') {
      const id = window.prompt('Enter Job ID to edit:');
      if (id && id.trim()) navigate(`/admin/jobs/${id.trim()}`);
      return;
    }

    // Placeholder pages (if not implemented yet)
    if (tab.route === '/applications' || tab.route === '/profile') {
      alert(`${tab.label} page coming soon!`);
      return;
    }

    navigate(tab.route);
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="nav-user-section">
            <div className="user-info">
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="user-role">
                {user?.role === 'STUDENT' ? 'Student' :
                    user?.role === 'COMPANY_REP' ? 'Company Rep' :
                      user?.role === 'ADMIN' ? 'Admin' : user?.role}
              </span>
            </div>
            <button onClick={() => logout()} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
