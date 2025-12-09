import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  ContactMethod: a.customType({
    type: a.enum(["EMAIL", "CAREERS_PAGE"]),
    value: a.string().required(),
  }),

  User: a
    .model({
      email: a.email().required(),
      password: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      role: a.enum(["STUDENT", "COMPANY_REP", "UGA_FACULTY", "ADMIN"]),
      phoneNumber: a.string(),
      // Student fields
      graduationYear: a.integer(),
      // Company rep fields
      companyName: a.string(),
      jobTitle: a.string(),
      industry: a.string(),
      jobPostings: a.hasMany("JobPosting", "postedBy"),
      applications: a.hasMany("Application", "studentEmail"),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .identifier(["email"])
    .secondaryIndexes((index: any) => [
      index("role").name("byRole"),
    ])
    .authorization((allow: any) => [
      allow.publicApiKey(),
    ]),

  JobPosting: a
    .model({
      title: a.string().required(),
      company: a.string().required(),
      industry: a.string().required(),
      jobType: a.enum(["INTERNSHIP", "FULL_TIME", "CONTRACT"]),
      description: a.string().required(),
      skills: a.string().array().required(),
      deadline: a.datetime().required(),
      contactMethod: a.ref("ContactMethod").required(),
      postedBy: a.email().required(),
      status: a.enum(["DRAFT", "PENDING", "APPROVED", "ARCHIVED"]),
      viewCount: a.integer().default(0),
      applicationCount: a.integer().default(0),
      adminComments: a.string(),
      approvedBy: a.email(),
      user: a.belongsTo("User", "postedBy"),
      applications: a.hasMany("Application", "jobId"),
    })
    .secondaryIndexes((index: any) => [
      index("postedBy").name("byPostedBy"),
      index("status").name("byStatus"),
      index("jobType").name("byJobType"),
      index("industry").name("byIndustry"),
    ])
    .authorization((allow: any) => [
      allow.publicApiKey(),
    ]),

  Application: a
    .model({
      studentEmail: a.email().required(),
      jobId: a.id().required(),
      appliedAt: a.datetime().required(),
      student: a.belongsTo("User", "studentEmail"),
      job: a.belongsTo("JobPosting", "jobId"),
    })
    .identifier(["studentEmail", "jobId"])
    .secondaryIndexes((index: any) => [
      index("studentEmail").name("byStudentEmail"),
      index("jobId").name("byJobId"),
    ])
    .authorization((allow: any) => [
      allow.publicApiKey(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});

/*
Usage in your React components:

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

// Create a user profile
await client.models.User.create({
  email: "student@university.edu",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
  role: "STUDENT",
  phoneNumber: "555-0123",
  graduationYear: 2025
});

// Create a job posting
await client.models.JobPosting.create({
  title: "Software Engineer Intern",
  company: "Tech Corp",
  industry: "Technology",
  jobType: "INTERNSHIP",
  description: "Great internship opportunity for MIS students",
  skills: ["JavaScript", "React", "Node.js", "Database Management"],
  deadline: "2024-12-31T23:59:59Z",
  contactMethod: {
    type: "EMAIL",
    value: "hr@techcorp.com"
  },
  postedBy: "admin@university.edu"
});

// List approved job postings
const { data: jobPostings } = await client.models.JobPosting.list({
  filter: { status: { eq: "APPROVED" } }
});

// Get user's job postings
const { data: userJobs } = await client.models.JobPosting.list({
  filter: { postedBy: { eq: "admin@university.edu" } }
});
*/