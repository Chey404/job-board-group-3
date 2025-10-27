import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { AuthProvider } from './contexts/AuthContext';
import SignInPage from './pages/SignInPage';
import CreateAccountPage from './pages/CreateAccountPage';
import StudentDashboard from './pages/StudentDashboard';
import CreateJobPage from './pages/CreateJobPage';
import MyJobPostingsPage from './pages/MyJobPostingsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
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
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
