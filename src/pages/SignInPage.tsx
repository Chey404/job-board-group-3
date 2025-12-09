import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './SignInPage.css';

  const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  if (!isAuthenticated) return;
  const stored = localStorage.getItem('currentUser');
  const currentUser = stored ? JSON.parse(stored) : null;
  const role = currentUser?.role;

  if (role === 'ADMIN')       navigate('/admin',   { replace: true });
  else if (role === 'STUDENT') navigate('/dashboard', { replace: true });
  else if (role === 'COMPANY_REP' || role === 'UGA_FACULTY') navigate('/dashboard', { replace: true });
  else                         navigate('/',        { replace: true });
}, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1>DawgsConnect</h1>
          <p>University of Georgia Student Job Board</p>
          <p className="signin-subtitle">Sign in to access job opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={error ? "error-message" : undefined}
              className={error ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={error ? "error-message" : undefined}
              className={error ? 'error' : ''}
            />
          </div>

          {error && (
            <div id="error-message" className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="create-account-link">
          <p>Don't have an account? <a href="/create-account">Create one here</a></p>
        </div>

        <div className="testing-credentials">
          <h3>For Testing</h3>
          <p className="testing-subtitle">Admin Account Login:</p>
          <div className="credentials-box">
            <p><strong>Username:</strong> superadmin@account.com</p>
            <p><strong>Password:</strong> go-bulldogs-!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
