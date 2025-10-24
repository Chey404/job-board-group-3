import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { AuthProvider } from './contexts/AuthContext';
import SignInPage from './pages/SignInPage';
import CreateAccountPage from './pages/CreateAccountPage';
import StudentDashboard from './pages/StudentDashboard';
import CreateJobPage from './pages/CreateJobPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import EditJobPage from './pages/EditJobPage';

import './App.css';

Amplify.configure(outputs);

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
