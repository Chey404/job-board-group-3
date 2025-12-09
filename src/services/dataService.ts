import { JobPosting, User, SavedJob } from '../types';
import { GraphQLService } from './graphqlService';
import {
  isMockDataEnabled,
  getMockJobs,
  getMockJobById,
  createMockJob,
  updateMockJob,
  deleteMockJob,
  incrementMockJobViewCount,
  searchMockJobs,
  isJobSavedMock,
  saveJobMock,
  unsaveJobMock,
  getSavedJobsMock,
  getSavedJobsWithDetailsMock,
} from './mockDataService';

/**
 * Unified Data Service
 * Automatically routes to mock data or Amplify GraphQL based on settings
 */
export class DataService {
  // Job Posting Operations
  static async getApprovedJobs(): Promise<JobPosting[]> {
    if (isMockDataEnabled()) {
      return getMockJobs().filter((job) => job.status === 'APPROVED');
    }
    return GraphQLService.getApprovedJobs();
  }

  static async getJobById(id: string): Promise<JobPosting | null> {
    if (isMockDataEnabled()) {
      return getMockJobById(id);
    }
    return GraphQLService.getJobById(id);
  }

  static async createJob(
    jobData: Omit<JobPosting, 'id' | 'viewCount' | 'applicationCount' | 'createdAt' | 'updatedAt'>
  ): Promise<JobPosting> {
    if (isMockDataEnabled()) {
      return createMockJob(jobData);
    }
    return GraphQLService.createJob(jobData);
  }

  static async updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
    if (isMockDataEnabled()) {
      const updated = updateMockJob(id, updates);
      if (!updated) throw new Error('Job not found');
      return updated;
    }
    return GraphQLService.updateJob(id, updates);
  }

  static async deleteJob(id: string): Promise<void> {
    if (isMockDataEnabled()) {
      const success = deleteMockJob(id);
      if (!success) throw new Error('Job not found');
      return;
    }
    return GraphQLService.deleteJob(id);
  }

  static async incrementJobViewCount(id: string): Promise<void> {
    if (isMockDataEnabled()) {
      incrementMockJobViewCount(id);
      return;
    }
    return GraphQLService.incrementJobViewCount(id);
  }

  // User Operations
  static async getUserProfile(email: string): Promise<User | null> {
    if (isMockDataEnabled()) {
      // For mock mode, just return null or a default user
      return null;
    }
    return GraphQLService.getUserProfile(email);
  }

  static async createUserProfile(userData: User): Promise<User> {
    if (isMockDataEnabled()) {
      // For mock mode, just return the user data as-is
      return userData;
    }
    return GraphQLService.createUserProfile(userData);
  }

  static async updateUserProfile(email: string, updates: Partial<User>): Promise<User> {
    if (isMockDataEnabled()) {
      throw new Error('User profile updates not supported in mock mode');
    }
    return GraphQLService.updateUserProfile(email, updates);
  }

  static async getUserJobs(userEmail: string): Promise<JobPosting[]> {
    if (isMockDataEnabled()) {
      return getMockJobs().filter((job) => job.postedBy === userEmail);
    }
    return GraphQLService.getUserJobs(userEmail);
  }

  static async autoArchiveExpiredJobs(jobs: JobPosting[]): Promise<void> {
    if (isMockDataEnabled()) {
      const now = new Date();
      const expiredJobs = jobs.filter(
        (job) => job.status !== 'ARCHIVED' && new Date(job.deadline) < now
      );

      for (const job of expiredJobs) {
        await this.updateJob(job.id, { status: 'ARCHIVED' });
      }
      return;
    }
    return GraphQLService.autoArchiveExpiredJobs(jobs);
  }

  // Authentication Operations
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    if (isMockDataEnabled()) {
      // For mock mode, allow any login (for testing)
      // In production, this would check against stored users
      return null;
    }
    return GraphQLService.authenticateUser(email, password);
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return false;
    }
    return GraphQLService.checkEmailExists(email);
  }

  // Filter and Search Operations
  static async searchJobs(
    searchTerm: string,
    jobType?: string,
    industry?: string
  ): Promise<JobPosting[]> {
    if (isMockDataEnabled()) {
      return searchMockJobs(searchTerm, jobType, industry);
    }
    return GraphQLService.searchJobs(searchTerm, jobType, industry);
  }

  // Lists all jobs regardless of status
  static async listAllJobs(): Promise<JobPosting[]> {
    if (isMockDataEnabled()) {
      return getMockJobs();
    }
    return GraphQLService.listAllJobs();
  }

  // Saved Jobs Operations
  static async isJobSaved(studentEmail: string, jobId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return isJobSavedMock(studentEmail, jobId);
    }
    return GraphQLService.isJobSaved(studentEmail, jobId);
  }

  static async saveJob(studentEmail: string, jobId: string): Promise<SavedJob> {
    if (isMockDataEnabled()) {
      return saveJobMock(studentEmail, jobId);
    }
    return GraphQLService.saveJob(studentEmail, jobId);
  }

  static async unsaveJob(studentEmail: string, jobId: string): Promise<void> {
    if (isMockDataEnabled()) {
      unsaveJobMock(studentEmail, jobId);
      return;
    }
    return GraphQLService.unsaveJob(studentEmail, jobId);
  }

  static async getSavedJobs(studentEmail: string): Promise<SavedJob[]> {
    if (isMockDataEnabled()) {
      return getSavedJobsMock(studentEmail);
    }
    return GraphQLService.getSavedJobs(studentEmail);
  }

  static async getSavedJobsWithDetails(studentEmail: string): Promise<JobPosting[]> {
    if (isMockDataEnabled()) {
      return getSavedJobsWithDetailsMock(studentEmail);
    }
    return GraphQLService.getSavedJobsWithDetails(studentEmail);
  }
}
