import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navigation.css';

type Role = 'STUDENT' | 'COMPANY_REP' | 'ADMIN' | string;

type Tab = {
  id: string;
  label: string;
  route?: string;
  roles: Role[];
  dropdown?: {
    id: string;
    label: string;
    route: string;
  }[];
};

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('job-board');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build tabs based on role
  const tabs: Tab[] = useMemo(() => {
    const role = user?.role as Role;

    // STUDENT
    if (role === 'STUDENT') {
      return [
        { id: 'job-board', label: 'DawgsConnect', route: '/dashboard', roles: ['STUDENT'] },
        { id: 'applications', label: 'My Applications', route: '/applications', roles: ['STUDENT'] },
        { id: 'profile', label: 'My Profile', route: '/profile', roles: ['STUDENT'] },
      ];
    }

    // COMPANY_REP and UGA_FACULTY (same permissions)
    if (role === 'COMPANY_REP' || role === 'UGA_FACULTY') {
      return [
        { id: 'job-board', label: 'DawgsConnect', route: '/dashboard', roles: ['COMPANY_REP', 'UGA_FACULTY'] },
        { id: 'my-jobs', label: 'My Postings', route: '/my-job-postings', roles: ['COMPANY_REP', 'UGA_FACULTY'] },
        { id: 'create-job', label: 'Create Job Post', route: '/create-job', roles: ['COMPANY_REP', 'UGA_FACULTY'] },
        { id: 'profile', label: 'Profile', route: '/profile', roles: ['COMPANY_REP', 'UGA_FACULTY'] },
      ];
    }

    // ADMIN
    if (role === 'ADMIN') {
      return [
        { id: 'dawgs-connect', label: 'DawgsConnect', route: '/dashboard', roles: ['ADMIN'] },
        { id: 'create-job', label: 'Create Job Post', route: '/create-job', roles: ['ADMIN'] },
        { id: 'my-jobs', label: 'My Postings', route: '/my-job-postings', roles: ['ADMIN'] },
        { id: 'profile', label: 'My Profile', route: '/profile', roles: ['ADMIN'] },
        {
          id: 'manage-dropdown',
          label: 'Manage',
          roles: ['ADMIN'],
          dropdown: [
            { id: 'manage-jobs', label: 'Manage Jobs', route: '/admin' },
            { id: 'users-roles', label: 'Users & Roles', route: '/admin/users' },
            { id: 'create-user', label: 'Create User', route: '/admin/create-user' },
            { id: 'metrics', label: 'Metrics', route: '/admin/metrics' },
          ]
        },
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

    // Admin routes
    if (pathname.startsWith('/admin/jobs/')) {
      setActiveTab('manage-jobs');
      return;
    }
    if (pathname === '/admin') {
      setActiveTab('manage-jobs');
      return;
    }
    if (pathname === '/admin/users') {
      setActiveTab('users-roles');
      return;
    }
    if (pathname === '/admin/metrics') {
      setActiveTab('metrics');
      return;
    }
    if (pathname === '/admin/create-user') {
      setActiveTab('create-user');
      return;
    }

    // Common routes
    const map: Record<string, string> = {
      '/dashboard': user?.role === 'ADMIN' ? 'dawgs-connect' : 'job-board',
      '/create-job': 'create-job',
      '/my-job-postings': 'my-jobs',
      '/applications': 'applications',
      '/profile': 'profile',
    };

    const found = map[pathname];
    if (found) setActiveTab(found);
  }, [location.pathname, user?.role]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    // If it's a dropdown, toggle it
    if (tab.dropdown) {
      setOpenDropdown(openDropdown === tabId ? null : tabId);
      return;
    }

    // Placeholder pages (if not implemented yet)
    if (tab.route === '/applications') {
      alert(`${tab.label} page coming soon!`);
      return;
    }

    if (tab.route) {
      navigate(tab.route);
      setOpenDropdown(null);
    }
  };

  const handleDropdownItemClick = (route: string) => {
    navigate(route);
    setOpenDropdown(null);
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-container">
        <div className="nav-content">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <div key={tab.id} className="nav-tab-wrapper" ref={tab.dropdown ? dropdownRef : null}>
                <button
                  className={`nav-tab ${
                    tab.dropdown
                      ? tab.dropdown.some(item => item.id === activeTab)
                        ? 'active'
                        : ''
                      : activeTab === tab.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                  {tab.dropdown && <span className="dropdown-arrow">▼</span>}
                </button>

                {tab.dropdown && openDropdown === tab.id && (
                  <div className="dropdown-menu">
                    {tab.dropdown.map(item => (
                      <button
                        key={item.id}
                        className={`dropdown-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => handleDropdownItemClick(item.route)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                      user?.role === 'UGA_FACULTY' ? 'UGA Faculty' :
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
