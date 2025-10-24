// src/services/adminService.ts
import { gqlRequest } from "./graphqlService"; // adapt to your actual export

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
  search?: string; company?: string; creator?: string;
  status?: "ALL" | "PENDING" | "ACTIVE" | "ARCHIVED";
  fromDate?: string; toDate?: string;
}): Promise<AdminJob[]> {
  const filter = {
    search: filters.search || undefined,
    companyName: filters.company || undefined,
    creator: filters.creator || undefined,
    status: filters.status && filters.status !== "ALL" ? filters.status : undefined,
    postedFrom: filters.fromDate ? new Date(filters.fromDate).toISOString() : undefined,
    postedTo: filters.toDate ? new Date(filters.toDate).toISOString() : undefined,
  };

  try {
    const res = await gqlRequest(LIST_JOBS_ADMIN, { filter });
    return res.listJobsAdmin as AdminJob[];
  } catch {
    // fallback to generic list if admin list isn't implemented yet
    const res = await gqlRequest(LIST_JOBS_GENERIC, {});
    let items = (res.listJobs as AdminJob[]) || [];
    // client-side filtering fallback
    if (filter.status) items = items.filter(i => i.status === filter.status);
    if (filter.companyName) items = items.filter(i => i.companyName?.toLowerCase().includes(filter.companyName!.toLowerCase()));
    if (filter.creator) items = items.filter(i => (i.creator ?? "").toLowerCase().includes(filter.creator!.toLowerCase()));
    if (filter.search) items = items.filter(i => (i.title ?? "").toLowerCase().includes(filter.search!.toLowerCase()));
    if (filter.postedFrom) items = items.filter(i => !i.postedDate || i.postedDate >= filter.postedFrom!);
    if (filter.postedTo) items = items.filter(i => !i.postedDate || i.postedDate <= filter.postedTo!);
    return items;
  }
}

export async function getJobAdmin(id: string): Promise<AdminJob> {
  const res = await gqlRequest(GET_JOB, { id });
  return res.getJob as AdminJob;
}

export async function updateJobAdmin(input: AdminJobInput): Promise<AdminJob> {
  const res = await gqlRequest(UPDATE_JOB, { input });
  return res.updateJob as AdminJob;
}

export async function updateJobStatusAdmin(id: string, status: "PENDING" | "ACTIVE" | "ARCHIVED") {
  // If your backend has approve/archive mutations, you can swap to them here.
  const now = new Date().toISOString();
  const res = await gqlRequest(UPDATE_JOB, {
    input: {
      id, status,
      reviewedDate: status === "ACTIVE" ? now : undefined,
    },
  });
  return res.updateJob as AdminJob;
}

export async function deleteJobAdmin(id: string) {
  const res = await gqlRequest(DELETE_JOB, { id });
  return res.deleteJob;
}

// Users / roles
export async function listUsersAdmin(): Promise<AdminUser[]> {
  try {
    const res = await gqlRequest(LIST_USERS_ADMIN, {});
    return res.listUsersAdmin as AdminUser[];
  } catch {
    // If not implemented on backend yet, show an empty table instead of breaking UI
    return [];
  }
}

export async function updateUserRoleAdmin(id: string, role: AdminUser["role"]) {
  const res = await gqlRequest(UPDATE_USER_ROLE, { id, role });
  return res.updateUserRole;
}

// Settings
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await gqlRequest(GET_PLATFORM_SETTINGS, {});
  return res.platformSettings as PlatformSettings;
}
export async function updatePlatformSettings(input: PlatformSettings) {
  const res = await gqlRequest(UPDATE_PLATFORM_SETTINGS, { input });
  return res.updatePlatformSettings as PlatformSettings;
}
