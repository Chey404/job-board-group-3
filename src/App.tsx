import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react'; 
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { AuthProvider } from './contexts/AuthContext';
import { AuthContext } from './contexts/AuthContext'; //
import SignInPage from './pages/SignInPage';
import CreateAccountPage from './pages/CreateAccountPage';
import StudentDashboard from './pages/StudentDashboard';
import CreateJobPage from './pages/CreateJobPage';
import MyJobPostingsPage from './pages/MyJobPostingsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import EditJobPage from './pages/EditJobPage';

import './App.css';

Amplify.configure(outputs);

//Checkpoint for Role Authentication
function RoleLanding() {
  const auth = useContext(AuthContext);
  // If auth context is still hydrating, render nothing (or a tiny spinner)
  if (!auth || auth.loading) return null;

  if (!auth.isAuthenticated) return <Navigate to="/signin" replace />;

  const role = (auth.user?.role ?? '').toString().toUpperCase();
  if (role === 'ADMIN')   return <Navigate to="/admin" replace />;
  if (role === 'STUDENT') return <Navigate to="/dashboard" replace />; // your student home
  if (role === 'COMPANY') return <Navigate to="/company" replace />;   // if/when you add it
  return <Navigate to="/dashboard" replace />; // safe fallback
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-job" 
                element={
                  <ProtectedRoute>
                    <CreateJobPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-job-postings" 
                element={
                  <ProtectedRoute>
                    <MyJobPostingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/job/:id" 
                element={
                  <ProtectedRoute>
                    <JobDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<RoleLanding />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs/:id"
                element={
                  <ProtectedRoute>
                    <EditJobPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
