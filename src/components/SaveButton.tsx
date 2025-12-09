import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DataService } from '../services/dataService';
import './SaveButton.css';

interface SaveButtonProps {
  jobId: string;
  onSaveStateChange?: (isSaved: boolean) => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ jobId, onSaveStateChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if job is saved on mount and when dependencies change
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !user || user.role !== 'STUDENT') {
        return;
      }

      try {
        const saved = await DataService.isJobSaved(user.email, jobId);
        setIsSaved(saved);
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    };

    checkSavedStatus();
  }, [isAuthenticated, user, jobId]);

  const handleToggleSave = async () => {
    if (!isAuthenticated || !user || user.role !== 'STUDENT') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSaved) {
        // Unsave the job
        await DataService.unsaveJob(user.email, jobId);
        setIsSaved(false);
        onSaveStateChange?.(false);
      } else {
        // Save the job
        await DataService.saveJob(user.email, jobId);
        setIsSaved(true);
        onSaveStateChange?.(true);
      }
    } catch (err) {
      console.error('Error toggling save state:', err);
      setError(isSaved ? 'Failed to unsave job' : 'Failed to save job');
      
      // Show error for 3 seconds then clear
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render for non-authenticated users or non-students
  if (!isAuthenticated || !user || user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="save-button-container">
      <button
        className={`save-button ${isSaved ? 'saved' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleToggleSave}
        disabled={isLoading}
        aria-label={isSaved ? 'Unsave this job' : 'Save this job'}
        title={isSaved ? 'Remove from saved jobs' : 'Save for later'}
      >
        <svg
          className="save-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="save-button-text">
          {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </span>
      </button>
      {error && (
        <div className="save-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default SaveButton;
