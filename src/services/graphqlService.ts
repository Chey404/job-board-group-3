import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { JobPosting, User, SavedJob } from "../types";

const client = generateClient<Schema>();

// Helper function to safely convert GraphQL job to our JobPosting type
function convertGraphQLJobToJobPosting(job: any): JobPosting {
    return {
        id: job.id,
        title: job.title || '',
        company: job.company || '',
        industry: job.industry || '',
        jobType: (job.jobType as 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT') || 'INTERNSHIP',
        description: job.description || '',
        skills: job.skills?.filter((skill: any) => skill !== null) || [],
        deadline: job.deadline || '',
        contactMethod: job.contactMethod || { type: 'EMAIL' as const, value: '' },
        postedBy: job.postedBy || '',
        status: (job.status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'ARCHIVED') || 'PENDING',
        viewCount: job.viewCount || 0,
        applicationCount: job.applicationCount || 0,
        adminComments: job.adminComments || undefined,
        approvedBy: job.approvedBy || undefined,
        createdAt: job.createdAt || '',
        updatedAt: job.updatedAt || '',
    };
}

// Helper function to safely convert GraphQL saved job to our SavedJob type
function convertGraphQLSavedJobToSavedJob(savedJob: any): SavedJob {
    return {
        studentEmail: savedJob.studentEmail || '',
        jobId: savedJob.jobId || '',
        savedAt: savedJob.savedAt || '',
        job: savedJob.job ? convertGraphQLJobToJobPosting(savedJob.job) : undefined,
    };
}

// Helper function to safely convert GraphQL user to our User type
function convertGraphQLUserToUser(user: any): User {
    return {
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: (user.role as 'STUDENT' | 'COMPANY_REP' | 'ADMIN') || 'STUDENT',
        phoneNumber: user.phoneNumber || undefined,
        graduationYear: user.graduationYear || undefined,
        companyName: user.companyName || undefined,
        jobTitle: user.jobTitle || undefined,
        industry: user.industry || undefined,
        createdAt: user.createdAt || undefined,
        updatedAt: user.updatedAt || undefined,
    };
}

export class GraphQLService {
    // Job Posting Operations
    static async getApprovedJobs(): Promise<JobPosting[]> {
        try {
            const { data: jobs, errors } = await client.models.JobPosting.list({
                filter: { status: { eq: "APPROVED" } }
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to fetch jobs");
            }

            return jobs.map(convertGraphQLJobToJobPosting);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error;
        }
    }

    static async getJobById(id: string): Promise<JobPosting | null> {
        try {
            const { data: job, errors } = await client.models.JobPosting.get({ id });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to fetch job");
            }

            if (!job) return null;

            return convertGraphQLJobToJobPosting(job);
        } catch (error) {
            console.error("Error fetching job:", error);
            throw error;
        }
    }

    static async createJob(jobData: Omit<JobPosting, 'id' | 'viewCount' | 'applicationCount' | 'createdAt' | 'updatedAt'>): Promise<JobPosting> {
        try {
            const { data: job, errors } = await client.models.JobPosting.create({
                title: jobData.title,
                company: jobData.company,
                industry: jobData.industry,
                jobType: jobData.jobType,
                description: jobData.description,
                skills: jobData.skills,
                deadline: jobData.deadline,
                contactMethod: jobData.contactMethod,
                postedBy: jobData.postedBy,
                status: jobData.status,
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to create job");
            }

            return convertGraphQLJobToJobPosting(job);
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    }

    static async updateJob(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
        try {
            const { data: job, errors } = await client.models.JobPosting.update({
                id,
                ...updates,
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to update job");
            }

            return convertGraphQLJobToJobPosting(job);
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    }

    static async deleteJob(id: string): Promise<void> {
        try {
            const { errors } = await client.models.JobPosting.delete({ id });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to delete job");
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            throw error;
        }
    }

    static async incrementJobViewCount(id: string): Promise<void> {
        try {
            // First get the current job to get the current view count
            const { data: job } = await client.models.JobPosting.get({ id });
            if (job) {
                await client.models.JobPosting.update({
                    id,
                    viewCount: (job.viewCount || 0) + 1,
                });
            }
        } catch (error) {
            console.error("Error incrementing view count:", error);
            // Don't throw error for view count increment failures
        }
    }

    // User Operations
    static async getUserProfile(email: string): Promise<User | null> {
        try {
            const { data: user, errors } = await client.models.User.get({ email });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to fetch user profile");
            }

            if (!user) return null;

            return convertGraphQLUserToUser(user);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    static async createUserProfile(userData: User): Promise<User> {
        try {
            const { data: user, errors } = await client.models.User.create({
                email: userData.email,
                password: userData.password || '',
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                phoneNumber: userData.phoneNumber,
                graduationYear: userData.graduationYear,
                companyName: userData.companyName,
                jobTitle: userData.jobTitle,
                industry: userData.industry,
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to create user profile");
            }

            return convertGraphQLUserToUser(user);
        } catch (error) {
            console.error("Error creating user profile:", error);
            throw error;
        }
    }

    static async updateUserProfile(email: string, updates: Partial<User>): Promise<User> {
        try {
            const { data: user, errors } = await client.models.User.update({
                email,
                ...updates,
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to update user profile");
            }

            return convertGraphQLUserToUser(user);
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    static async getUserJobs(userEmail: string): Promise<JobPosting[]> {
        try {
            const { data: jobs, errors } = await client.models.JobPosting.list({
                filter: { postedBy: { eq: userEmail } }
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to fetch user jobs");
            }

            const jobPostings = jobs.map(convertGraphQLJobToJobPosting);
            
            // Auto-archive expired jobs
            await this.autoArchiveExpiredJobs(jobPostings);
            
            // Fetch updated jobs after auto-archiving
            const { data: updatedJobs } = await client.models.JobPosting.list({
                filter: { postedBy: { eq: userEmail } }
            });
            
            return updatedJobs.map(convertGraphQLJobToJobPosting);
        } catch (error) {
            console.error("Error fetching user jobs:", error);
            throw error;
        }
    }

    static async autoArchiveExpiredJobs(jobs: JobPosting[]): Promise<void> {
        const now = new Date();
        const expiredJobs = jobs.filter(job => 
            job.status !== 'ARCHIVED' && 
            new Date(job.deadline) < now
        );

        for (const job of expiredJobs) {
            try {
                await this.updateJob(job.id, { status: 'ARCHIVED' });
            } catch (error) {
                console.error(`Failed to auto-archive job ${job.id}:`, error);
                // Continue with other jobs even if one fails
            }
        }
    }

    // Authentication Operations
    static async authenticateUser(email: string, password: string): Promise<User | null> {
        try {
            const { data: users, errors } = await client.models.User.list({
                filter: {
                    email: { eq: email },
                    password: { eq: password }
                }
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to authenticate user");
            }

            if (users && users.length > 0) {
                return convertGraphQLUserToUser(users[0]);
            }

            return null;
        } catch (error) {
            console.error("Error authenticating user:", error);
            throw error;
        }
    }

    static async checkEmailExists(email: string): Promise<boolean> {
        try {
            const { data: users, errors } = await client.models.User.list({
                filter: { email: { eq: email } }
            });

            if (errors) {
                console.error("GraphQL errors:", errors);
                return false;
            }

            return users && users.length > 0;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    }

    // Filter and Search Operations
    static async searchJobs(searchTerm: string, jobType?: string, industry?: string): Promise<JobPosting[]> {
        try {
            let filter: any = { status: { eq: "APPROVED" } };

            if (jobType && jobType !== 'all') {
                filter.jobType = { eq: jobType.toUpperCase() };
            }

            if (industry && industry !== 'all') {
                filter.industry = { eq: industry };
            }

            const { data: jobs, errors } = await client.models.JobPosting.list({ filter });

            if (errors) {
                console.error("GraphQL errors:", errors);
                throw new Error("Failed to search jobs");
            }

            let filteredJobs = jobs.map(convertGraphQLJobToJobPosting);

            // Client-side text search since DynamoDB doesn't support full-text search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filteredJobs = filteredJobs.filter(job =>
                    job.title.toLowerCase().includes(searchLower) ||
                    job.company.toLowerCase().includes(searchLower) ||
                    job.description.toLowerCase().includes(searchLower) ||
                    job.skills.some(skill => skill.toLowerCase().includes(searchLower))
                );
            }

            return filteredJobs;
        } catch (error) {
            console.error("Error searching jobs:", error);
            throw error;
        }
    }

    //Lists all jobs regardless of status
      static async listAllJobs(): Promise<JobPosting[]> {
    try {
      const { data: jobs, errors } = await client.models.JobPosting.list({});
      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to fetch all jobs");
      }
      return (jobs ?? []).map(convertGraphQLJobToJobPosting);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      throw error;
    }
  }

  // List all users (for admin)
  static async listAllUsers(): Promise<User[]> {
    try {
      const { data: users, errors } = await client.models.User.list({});
      
      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to fetch all users");
      }
      
      return (users ?? []).map(convertGraphQLUserToUser);
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  // Saved Jobs Operations
  static async isJobSaved(studentEmail: string, jobId: string): Promise<boolean> {
    try {
      const { data: savedJob, errors } = await client.models.SavedJob.get({
        studentEmail,
        jobId,
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to check if job is saved");
      }

      return savedJob !== null && savedJob !== undefined;
    } catch (error) {
      console.error("Error checking if job is saved:", error);
      throw error;
    }
  }

  static async saveJob(studentEmail: string, jobId: string): Promise<SavedJob> {
    try {
      const savedAt = new Date().toISOString();
      
      const { data: savedJob, errors } = await client.models.SavedJob.create({
        studentEmail,
        jobId,
        savedAt,
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to save job");
      }

      if (!savedJob) {
        throw new Error("Failed to create saved job record");
      }

      return convertGraphQLSavedJobToSavedJob(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      throw error;
    }
  }

  static async unsaveJob(studentEmail: string, jobId: string): Promise<void> {
    try {
      const { errors } = await client.models.SavedJob.delete({
        studentEmail,
        jobId,
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to unsave job");
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
      throw error;
    }
  }

  static async getSavedJobs(studentEmail: string): Promise<SavedJob[]> {
    try {
      const { data: savedJobs, errors } = await client.models.SavedJob.list({
        filter: { studentEmail: { eq: studentEmail } },
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        throw new Error("Failed to fetch saved jobs");
      }

      return (savedJobs ?? []).map(convertGraphQLSavedJobToSavedJob);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      throw error;
    }
  }

  static async getSavedJobsWithDetails(studentEmail: string): Promise<JobPosting[]> {
    try {
      // First get all saved jobs for the student
      const savedJobs = await this.getSavedJobs(studentEmail);

      // Then fetch the full job details for each saved job
      const jobPromises = savedJobs.map(async (savedJob) => {
        try {
          const job = await this.getJobById(savedJob.jobId);
          return job;
        } catch (error) {
          console.error(`Error fetching job ${savedJob.jobId}:`, error);
          return null;
        }
      });

      const jobs = await Promise.all(jobPromises);

      // Filter out any null values (jobs that failed to fetch or were deleted)
      return jobs.filter((job): job is JobPosting => job !== null);
    } catch (error) {
      console.error("Error fetching saved jobs with details:", error);
      throw error;
    }
  }
}
