import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('job-board');

  // Define role-based navigation tabs
  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'job-board', label: 'DawgsConnect', route: '/dashboard', roles: ['STUDENT', 'COMPANY_REP', 'ADMIN'] }
    ];

    if (user?.role === 'COMPANY_REP' || user?.role === 'ADMIN') {
      baseTabs.push(
        { id: 'create-job', label: 'Create Job Posting', route: '/create-job', roles: ['COMPANY_REP', 'ADMIN'] },
        { id: 'my-jobs', label: 'My Job Postings', route: '/my-job-postings', roles: ['COMPANY_REP', 'ADMIN'] }
      );
    }

    baseTabs.push(
      { id: 'profile', label: 'My Profile', route: '/profile', roles: ['STUDENT', 'COMPANY_REP', 'ADMIN'] }
    );

    return baseTabs.filter(tab => tab.roles.includes(user?.role || 'STUDENT'));
  };

  const tabs = getTabsForRole();

  useEffect(() => {
    // Set active tab based on current route
    const tabRoutes = [
      { id: 'job-board', route: '/dashboard' },
      { id: 'create-job', route: '/create-job' },
      { id: 'my-jobs', route: '/my-job-postings' },
      { id: 'profile', route: '/profile' }
    ];
    const currentTab = tabRoutes.find(tab => tab.route === location.pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      if (tab.route === '/profile') {
        // For now, show placeholder for unimplemented routes
        alert(`${tab.label} page coming soon!`);
      } else {
        navigate(tab.route);
      }
    }
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