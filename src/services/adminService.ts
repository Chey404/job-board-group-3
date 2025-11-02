// src/services/adminService.ts
import * as gql from "./graphqlService";
import { GraphQLService } from "./graphqlService";
const call = (doc: string, vars: any) =>
(gql as any).gqlRequest?.(doc, vars) ??
(gql as any).request?.(doc, vars) ??
(gql as any).query?.(doc, vars) ??
(gql as any).default?.request?.(doc, vars) ??
Promise.reject(new Error("No GraphQL request function exported by graphqlService"));


export type AdminJob = {
  id: string;
  title: string;
  companyName: string;
  description?: string | null;
  postedDate?: string | null;
  reviewedDate?: string | null;
  expirationDate?: string | null;
  status: "PENDING" | "ACTIVE" | "ARCHIVED";
  creator?: string | null;
};
export type AdminJobInput = {
  id: string;
  title: string;
  companyName: string;
  description?: string | null;
  postedDate?: string | null;
  reviewedDate?: string | null;
  expirationDate?: string | null;
  status: "PENDING" | "ACTIVE" | "ARCHIVED";
};
export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "STUDENT" | "COMPANY" | "ADMIN";
};
export type PlatformSettings = {
  approvalRequired: boolean;
  postingExpirationDays: number;
};

// --- GraphQL docs ---
// If your backend already has admin resolvers, call them directly.
// If it doesn't: we can still meet ACs by using the generic job list & update mutations.
// These names are written to be easy to swap later.

const LIST_JOBS_ADMIN = `
  query ListJobsAdmin($filter: JobFilterInput) {
    listJobsAdmin(filter: $filter) {
      id title companyName description creator
      postedDate reviewedDate expirationDate status
    }
  }
`;

// Fallback (if listJobsAdmin isn't available):
const LIST_JOBS_GENERIC = `
  query ListJobs {
    listJobs {
      id title companyName description creator
      postedDate reviewedDate expirationDate status
    }
  }
`;

const GET_JOB = `
  query GetJob($id: ID!) {
    getJob(id: $id) {
      id title companyName description creator
      postedDate reviewedDate expirationDate status
    }
  }
`;

const UPDATE_JOB = `
  mutation UpdateJob($input: UpdateJobInput!) {
    updateJob(input: $input) {
      id title companyName description postedDate reviewedDate expirationDate status
    }
  }
`;

const DELETE_JOB = `
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) { id }
  }
`;

// Optional admin endpoints (use if present; otherwise we’ll just call UPDATE_JOB to set status)
const LIST_USERS_ADMIN = `
  query ListUsersAdmin {
    listUsersAdmin { id email name role }
  }
`;
const UPDATE_USER_ROLE = `
  mutation UpdateUserRole($id: ID!, $role: Role!) {
    updateUserRole(id: $id, role: $role) { id role }
  }
`;
const GET_PLATFORM_SETTINGS = `
  query GetPlatformSettings {
    platformSettings { approvalRequired postingExpirationDays }
  }
`;
const UPDATE_PLATFORM_SETTINGS = `
  mutation UpdatePlatformSettings($input: PlatformSettingsInput!) {
    updatePlatformSettings(input: $input) { approvalRequired postingExpirationDays }
  }
`;

// --- API surface used by the pages ---

export async function listJobsAdmin(filters: {
  search?: string;
  company?: string;
  creator?: string;
  status?: "ALL" | "PENDING" | "ACTIVE" | "ARCHIVED";
  fromDate?: string;
  toDate?: string;
}): Promise<AdminJob[]> {
  try {
    // Try using the same approved jobs endpoint StudentDashboard uses
    const allJobs = await GraphQLService.getApprovedJobs();

    let filtered = allJobs;

    // Apply local filters if needed
    if (filters.search) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search!.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.company) {
      filtered = filtered.filter(job =>
        job.company.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      filtered = filtered.filter(job => new Date(job.createdAt) >= from);
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate);
      filtered = filtered.filter(job => new Date(job.createdAt) <= to);
    }

    // Map fields to AdminJob format if necessary
    return filtered.map(job => ({
      id: job.id,
      title: job.title,
      companyName: job.company,
      description: job.description,
      postedDate: job.createdAt,
      reviewedDate: job.updatedAt ?? null,
      expirationDate: job.deadline ?? null,
      status: job.status === "APPROVED" ? "ACTIVE" : "PENDING",
      creator: job.postedBy ?? null,
    }));
  } catch (err) {
    console.error("Failed to load admin jobs:", err);
    return [];
  }
}

export async function getJobAdmin(id: string): Promise<AdminJob> {
  try {
    const job = await GraphQLService.getJobById(id);
    return {
      id: job.id,
      title: job.title,
      companyName: job.company,
      description: job.description,
      postedDate: job.createdAt,
      reviewedDate: job.updatedAt ?? null,
      expirationDate: job.deadline ?? null,
      status: job.status === "APPROVED" ? "ACTIVE" : "PENDING",
      creator: job.postedBy ?? null,
    };
  } catch (err) {
    console.error("Failed to load job details:", err);
    throw err;
  }
}

export async function updateJobAdmin(input: AdminJobInput): Promise<AdminJob> {
  const res = await call(UPDATE_JOB, { input });
  return res.updateJob as AdminJob;
}

export async function updateJobStatusAdmin(id: string, status: "PENDING" | "ACTIVE" | "ARCHIVED") {
  // If your backend has approve/archive mutations, you can swap to them here.
  const now = new Date().toISOString();
  const res = await call(UPDATE_JOB, {
    input: {
      id,
      status,
      reviewedDate: status === "ACTIVE" ? now : undefined,
    },
  });
  return res.updateJob as AdminJob;
}

export async function deleteJobAdmin(id: string) {
  const res = await call(DELETE_JOB, { id });
  return res.deleteJob;
}

// Users / roles
export async function listUsersAdmin(): Promise<AdminUser[]> {
  try {
    const res = await call(LIST_USERS_ADMIN, {});
    return res.listUsersAdmin as AdminUser[];
  } catch {
    // If not implemented on backend yet, show an empty table instead of breaking UI
    return [];
  }
}

export async function updateUserRoleAdmin(id: string, role: AdminUser["role"]) {
  const res = await call(UPDATE_USER_ROLE, { id, role });
  return res.updateUserRole;
}

// Settings
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await call(GET_PLATFORM_SETTINGS, {});
  return res.platformSettings as PlatformSettings;
}
export async function updatePlatformSettings(input: PlatformSettings) {
  const res = await call(UPDATE_PLATFORM_SETTINGS, { input });
  return res.updatePlatformSettings as PlatformSettings;
}
