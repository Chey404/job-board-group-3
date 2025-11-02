// src/services/adminService.ts
import * as gql from "./graphqlService";
import { GraphQLService } from "./graphqlService";
import type { JobPosting } from "../types";

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

// --- API surface used by the pages ---

export async function listJobsAdmin(filters: {
  search?: string; company?: string; creator?: string;
  status?: "ALL" | "PENDING" | "ACTIVE" | "ARCHIVED";
  fromDate?: string; toDate?: string;
}): Promise<AdminJob[]> {
  // Pull the same jobs StudentDashboard shows (APPROVED)
  const all = await GraphQLService.getApprovedJobs();

  // Map Student JobPosting -> AdminJob
  let items: AdminJob[] = all.map((j) => ({
    id: j.id,
    title: j.title,
    companyName: j.company ?? "—",
    description: j.description ?? null,
    postedDate: j.createdAt ?? null,             // Student uses createdAt
    reviewedDate: j.updatedAt ?? null,           // best available proxy
    expirationDate: j.deadline ?? null,          // Student uses deadline
    status:
      j.status === "APPROVED" ? "ACTIVE" :
      j.status === "ARCHIVED" ? "ARCHIVED" :
      "PENDING",                                  // DRAFT/PENDING -> PENDING
    creator: j.postedBy ?? null,
  }));

  // Safe date parser
  const toDateObj = (v?: string) => (v ? new Date(v) : undefined);
  const from = toDateObj(filters.fromDate);
  const to   = toDateObj(filters.toDate);

  // Filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(i =>
      (i.title ?? "").toLowerCase().includes(q) ||
      (i.companyName ?? "").toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q)
    );
  }

  if (filters.company) {
    const q = filters.company.toLowerCase();
    items = items.filter(i => (i.companyName ?? "").toLowerCase().includes(q));
  }

  if (filters.creator) {
    const q = filters.creator.toLowerCase();
    items = items.filter(i => (i.creator ?? "").toLowerCase().includes(q));
  }

  if (filters.status && filters.status !== "ALL") {
    items = items.filter(i => i.status === filters.status);
  }

  if (from) {
    items = items.filter(i => {
      const d = i.postedDate ? new Date(i.postedDate) : undefined;
      return d ? d >= from : true;
    });
  }

  if (to) {
    items = items.filter(i => {
      const d = i.postedDate ? new Date(i.postedDate) : undefined;
      return d ? d <= to : true;
    });
  }

  return items;
}

export async function getJobAdmin(id: string): Promise<AdminJob> {
  const job = await GraphQLService.getJobById(id);
  if (!job) throw new Error("Job not found");

  return {
    id: job.id,
    title: job.title,
    companyName: job.company ?? "—",
    description: job.description ?? null,
    postedDate: job.createdAt ?? null,
    reviewedDate: job.updatedAt ?? null,
    expirationDate: job.deadline ?? null,
    status:
      job.status === "APPROVED" ? "ACTIVE" :
      job.status === "ARCHIVED" ? "ARCHIVED" :
      "PENDING",
    creator: job.postedBy ?? null,
  };
}

export async function updateJobAdmin(input: AdminJobInput): Promise<AdminJob> {
  const updated = await GraphQLService.updateJob(input.id, {
    title: input.title,
    company: input.companyName,                 // map back to JobPosting
    description: input.description ?? undefined,
    // Student model fields:
    createdAt: input.postedDate ?? undefined,   // optional; usually server sets
    updatedAt: input.reviewedDate ?? undefined, // not typical to set manually
    deadline: input.expirationDate ?? undefined,
    // Keep status mapping consistent with your model (optional here)
  });

  return {
    id: updated.id,
    title: updated.title,
    companyName: updated.company ?? "—",
    description: updated.description ?? null,
    postedDate: updated.createdAt ?? null,
    reviewedDate: updated.updatedAt ?? null,
    expirationDate: updated.deadline ?? null,
    status:
      updated.status === "APPROVED" ? "ACTIVE" :
      updated.status === "ARCHIVED" ? "ARCHIVED" :
      "PENDING",
    creator: updated.postedBy ?? null,
  };
}

export async function updateJobStatusAdmin(
  id: string,
  status: "PENDING" | "ACTIVE" | "ARCHIVED"
) {
  const jobStatus: JobPosting["status"] =
    status === "ACTIVE"   ? "APPROVED" :
    status === "ARCHIVED" ? "ARCHIVED" :
                            "PENDING";

  const payload: Partial<JobPosting> = { status: jobStatus };

  if (status === "ACTIVE") {
    payload.approvedBy = "admin@system";        // or the current admin email
    payload.updatedAt  = new Date().toISOString();
  }

  await GraphQLService.updateJob(id, payload);
}

export async function deleteJobAdmin(id: string) {
  await GraphQLService.deleteJob(id);
  return { id };
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
