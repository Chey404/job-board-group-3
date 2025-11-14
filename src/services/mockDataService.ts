import { JobPosting, User } from '../types';

// Mock job postings data stored in localStorage
const MOCK_JOBS_KEY = 'mock_job_postings';
const MOCK_USERS_KEY = 'mock_users';
const USE_MOCK_DATA_KEY = 'use_mock_data';

// Initial mock job data
export const initialMockJobs: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Software Engineer Intern",
    company: "TechNova",
    industry: "Software",
    jobType: "INTERNSHIP",
    description: "Work with development team to build innovative software solutions.",
    skills: ["JavaScript", "React", "Git", "Problem Solving", "Communication"],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "careers@technova.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 45,
    applicationCount: 12,
  },
  {
    title: "Backend Software Engineer",
    company: "CloudCore",
    industry: "Software",
    jobType: "FULL_TIME",
    description: "Design and maintain scalable backend systems for our cloud platform.",
    skills: ["Python", "Node.js", "SQL", "System Design", "Collaboration"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE", value: "https://cloudcore.com/careers" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 78,
    applicationCount: 23,
  },
  {
    title: "Data Analyst",
    company: "Insight Analytics",
    industry: "Data & Analytics",
    jobType: "FULL_TIME",
    description: "Analyze business data and create dashboards to drive decision-making.",
    skills: ["SQL", "Tableau", "Excel", "Statistical Analysis", "Communication"],
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "jobs@insightanalytics.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 102,
    applicationCount: 31,
  },
  {
    title: "Business Intelligence Intern",
    company: "BrightPoint",
    industry: "Data & Analytics",
    jobType: "INTERNSHIP",
    description: "Support BI team in data analysis and reporting projects.",
    skills: ["Python", "Excel", "Power BI", "Data Cleaning", "Curiosity"],
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "intern@brightpoint.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 56,
    applicationCount: 18,
  },
  {
    title: "Associate Product Manager",
    company: "NextWave",
    industry: "Technology",
    jobType: "FULL_TIME",
    description: "Support product teams in gathering requirements and delivering features.",
    skills: ["JIRA", "Requirements Writing", "UX Understanding", "Prioritization", "Communication"],
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE", value: "https://nextwave.com/jobs" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 89,
    applicationCount: 27,
  },
  {
    title: "Product Management Intern",
    company: "Streamline",
    industry: "Technology",
    jobType: "INTERNSHIP",
    description: "Assist PMs in research, documentation, and feature planning.",
    skills: ["Research", "Documentation", "Agile", "Communication", "Time Management"],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "pm-intern@streamline.io" },
    postedBy: "admin@university.edu",
    status: "PENDING",
    viewCount: 34,
    applicationCount: 8,
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureShield",
    industry: "Cybersecurity",
    jobType: "FULL_TIME",
    description: "Monitor systems and respond to security threats in real-time.",
    skills: ["SIEM Tools", "Networking", "Threat Detection", "Problem Solving"],
    deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "security@secureshield.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 67,
    applicationCount: 15,
  },
  {
    title: "Security Operations Intern",
    company: "Fortify Network",
    industry: "Cybersecurity",
    jobType: "INTERNSHIP",
    description: "Assist in security operations and policy documentation.",
    skills: ["NIST", "Documentation", "Attention to Detail", "Communication"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "intern@fortifynet.com" },
    postedBy: "admin@university.edu",
    status: "PENDING",
    viewCount: 23,
    applicationCount: 5,
  },
  {
    title: "Mechanical Engineer",
    company: "Precision Mechanics",
    industry: "Engineering",
    jobType: "FULL_TIME",
    description: "Support product development with CAD modeling and testing.",
    skills: ["SolidWorks", "GD&T", "Thermodynamics", "Collaboration"],
    deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE", value: "https://precisionmech.com/careers" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 91,
    applicationCount: 19,
  },
  {
    title: "Industrial Engineering Intern",
    company: "FlowOpt Logistics",
    industry: "Engineering",
    jobType: "INTERNSHIP",
    description: "Improve workflow efficiency through time studies and process mapping.",
    skills: ["Lean Principles", "Excel", "Process Mapping", "Problem Solving"],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "ie-intern@flowopt.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 42,
    applicationCount: 11,
  },
  {
    title: "Marketing Coordinator",
    company: "Vivid Creative",
    industry: "Marketing",
    jobType: "FULL_TIME",
    description: "Coordinate campaigns and manage content across multiple channels.",
    skills: ["Copywriting", "Social Media Tools", "Creativity", "Organization"],
    deadline: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "marketing@vividcreative.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 73,
    applicationCount: 22,
  },
  {
    title: "Content Marketing Intern",
    company: "BrandLift Media",
    industry: "Marketing",
    jobType: "INTERNSHIP",
    description: "Support content team in writing blog posts and social media content.",
    skills: ["Writing", "SEO Basics", "Creativity", "Time Management"],
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "content@brandlift.com" },
    postedBy: "admin@university.edu",
    status: "DRAFT",
    viewCount: 15,
    applicationCount: 3,
  },
  {
    title: "Sales Development Representative",
    company: "LeadFlow",
    industry: "Sales",
    jobType: "FULL_TIME",
    description: "Generate and qualify leads through outreach and demos.",
    skills: ["Communication", "CRM Tools", "Resilience", "Negotiation"],
    deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE", value: "https://leadflow.com/jobs" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 58,
    applicationCount: 14,
  },
  {
    title: "Business Development Intern",
    company: "GrowthEdge",
    industry: "Sales",
    jobType: "INTERNSHIP",
    description: "Identify potential clients and support research efforts.",
    skills: ["Research", "Outreach", "CRM Basics", "Collaboration"],
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "bd-intern@growthedge.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 39,
    applicationCount: 9,
  },
  {
    title: "Financial Analyst",
    company: "Summit Financial",
    industry: "Finance",
    jobType: "FULL_TIME",
    description: "Perform financial analysis and create forecasting models.",
    skills: ["Excel", "Financial Modeling", "Accounting Principles", "Critical Thinking"],
    deadline: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "careers@summitfinancial.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 85,
    applicationCount: 25,
  },
  {
    title: "Accounting Intern",
    company: "LedgerWorks",
    industry: "Finance",
    jobType: "INTERNSHIP",
    description: "Support bookkeeping and transaction recording tasks.",
    skills: ["Excel", "QuickBooks", "Attention to Detail", "Organization"],
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "accounting@ledgerworks.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 47,
    applicationCount: 13,
  },
  {
    title: "HR Coordinator",
    company: "Unity Talent",
    industry: "Human Resources",
    jobType: "FULL_TIME",
    description: "Support recruiting and scheduling interview processes.",
    skills: ["People Skills", "Organization", "ATS Tools", "Confidentiality"],
    deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE", value: "https://unitytalent.com/join-us" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 64,
    applicationCount: 17,
  },
  {
    title: "People Operations Intern",
    company: "CultureSpace",
    industry: "Human Resources",
    jobType: "INTERNSHIP",
    description: "Assist HR team in surveys, onboarding, and employee engagement.",
    skills: ["Excel", "Communication", "Coordination", "Professionalism"],
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "hr-intern@culturespace.com" },
    postedBy: "admin@university.edu",
    status: "ARCHIVED",
    viewCount: 28,
    applicationCount: 6,
  },
  {
    title: "Supply Chain Analyst",
    company: "TransLogix",
    industry: "Supply Chain",
    jobType: "FULL_TIME",
    description: "Optimize supply chain operations and analyze sourcing strategies.",
    skills: ["Excel", "SAP", "Supply Chain Concepts", "Problem Solving"],
    deadline: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "jobs@translogix.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 71,
    applicationCount: 20,
  },
  {
    title: "Logistics Intern",
    company: "RapidMove",
    industry: "Supply Chain",
    jobType: "INTERNSHIP",
    description: "Support daily logistics operations and shipment monitoring.",
    skills: ["Communication", "Scheduling", "Data Entry", "Organization"],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL", value: "logistics@rapidmove.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED",
    viewCount: 31,
    applicationCount: 7,
  },
];

// Helper to generate unique IDs
function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize mock data
export function initializeMockData() {
  const existingJobs = localStorage.getItem(MOCK_JOBS_KEY);
  if (!existingJobs) {
    const jobsWithIds: JobPosting[] = initialMockJobs.map((job, index) => ({
      ...job,
      id: `job-${index + 1}`,
      createdAt: new Date(Date.now() - (20 - index) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (20 - index) * 24 * 60 * 60 * 1000).toISOString(),
    }));
    localStorage.setItem(MOCK_JOBS_KEY, JSON.stringify(jobsWithIds));
  }
}

// Get all mock jobs
export function getMockJobs(): JobPosting[] {
  const data = localStorage.getItem(MOCK_JOBS_KEY);
  return data ? JSON.parse(data) : [];
}

// Set mock jobs
export function setMockJobs(jobs: JobPosting[]) {
  localStorage.setItem(MOCK_JOBS_KEY, JSON.stringify(jobs));
}

// Check if mock data mode is enabled
export function isMockDataEnabled(): boolean {
  const enabled = localStorage.getItem(USE_MOCK_DATA_KEY);
  return enabled === 'true';
}

// Toggle mock data mode
export function setMockDataEnabled(enabled: boolean) {
  localStorage.setItem(USE_MOCK_DATA_KEY, enabled.toString());
  if (enabled) {
    initializeMockData();
  }
}

// Reset mock data to initial state
export function resetMockData() {
  localStorage.removeItem(MOCK_JOBS_KEY);
  localStorage.removeItem(MOCK_USERS_KEY);
  initializeMockData();
}

// Get mock job by ID
export function getMockJobById(id: string): JobPosting | null {
  const jobs = getMockJobs();
  return jobs.find((job) => job.id === id) || null;
}

// Create mock job
export function createMockJob(jobData: Omit<JobPosting, 'id' | 'viewCount' | 'applicationCount' | 'createdAt' | 'updatedAt'>): JobPosting {
  const jobs = getMockJobs();
  const newJob: JobPosting = {
    ...jobData,
    id: generateId(),
    viewCount: 0,
    applicationCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  setMockJobs(jobs);
  return newJob;
}

// Update mock job
export function updateMockJob(id: string, updates: Partial<JobPosting>): JobPosting | null {
  const jobs = getMockJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return null;

  const updatedJob = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  jobs[index] = updatedJob;
  setMockJobs(jobs);
  return updatedJob;
}

// Delete mock job
export function deleteMockJob(id: string): boolean {
  const jobs = getMockJobs();
  const filtered = jobs.filter((job) => job.id !== id);
  if (filtered.length === jobs.length) return false;
  setMockJobs(filtered);
  return true;
}

// Increment view count
export function incrementMockJobViewCount(id: string) {
  const job = getMockJobById(id);
  if (job) {
    updateMockJob(id, { viewCount: (job.viewCount || 0) + 1 });
  }
}

// Search mock jobs
export function searchMockJobs(searchTerm: string, jobType?: string, industry?: string): JobPosting[] {
  let jobs = getMockJobs().filter((job) => job.status === 'APPROVED');

  if (jobType && jobType !== 'all') {
    jobs = jobs.filter((job) => job.jobType === jobType.toUpperCase());
  }

  if (industry && industry !== 'all') {
    jobs = jobs.filter((job) => job.industry === industry);
  }

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  }

  return jobs;
}
