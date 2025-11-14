import { GraphQLService } from '../services/graphqlService';

// Mock job postings data
export const mockJobPostings = [
  {
    title: "Software Engineer Intern",
    company: "TechNova",
    industry: "Software",
    jobType: "INTERNSHIP" as const,
    description: "Work with development team to build innovative software solutions.",
    skills: ["JavaScript", "React", "Git", "Problem Solving", "Communication"],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    contactMethod: { type: "EMAIL" as const, value: "careers@technova.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Backend Software Engineer",
    company: "CloudCore",
    industry: "Software",
    jobType: "FULL_TIME" as const,
    description: "Design and maintain scalable backend systems for our cloud platform.",
    skills: ["Python", "Node.js", "SQL", "System Design", "Collaboration"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE" as const, value: "https://cloudcore.com/careers" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Data Analyst",
    company: "Insight Analytics",
    industry: "Data & Analytics",
    jobType: "FULL_TIME" as const,
    description: "Analyze business data and create dashboards to drive decision-making.",
    skills: ["SQL", "Tableau", "Excel", "Statistical Analysis", "Communication"],
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "jobs@insightanalytics.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Business Intelligence Intern",
    company: "BrightPoint",
    industry: "Data & Analytics",
    jobType: "INTERNSHIP" as const,
    description: "Support BI team in data analysis and reporting projects.",
    skills: ["Python", "Excel", "Power BI", "Data Cleaning", "Curiosity"],
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "intern@brightpoint.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Associate Product Manager",
    company: "NextWave",
    industry: "Technology",
    jobType: "FULL_TIME" as const,
    description: "Support product teams in gathering requirements and delivering features.",
    skills: ["JIRA", "Requirements Writing", "UX Understanding", "Prioritization", "Communication"],
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE" as const, value: "https://nextwave.com/jobs" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Product Management Intern",
    company: "Streamline",
    industry: "Technology",
    jobType: "INTERNSHIP" as const,
    description: "Assist PMs in research, documentation, and feature planning.",
    skills: ["Research", "Documentation", "Agile", "Communication", "Time Management"],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "pm-intern@streamline.io" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Cybersecurity Analyst",
    company: "SecureShield",
    industry: "Cybersecurity",
    jobType: "FULL_TIME" as const,
    description: "Monitor systems and respond to security threats in real-time.",
    skills: ["SIEM Tools", "Networking", "Threat Detection", "Problem Solving"],
    deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "security@secureshield.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Security Operations Intern",
    company: "Fortify Network",
    industry: "Cybersecurity",
    jobType: "INTERNSHIP" as const,
    description: "Assist in security operations and policy documentation.",
    skills: ["NIST", "Documentation", "Attention to Detail", "Communication"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "intern@fortifynet.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Mechanical Engineer",
    company: "Precision Mechanics",
    industry: "Engineering",
    jobType: "FULL_TIME" as const,
    description: "Support product development with CAD modeling and testing.",
    skills: ["SolidWorks", "GD&T", "Thermodynamics", "Collaboration"],
    deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE" as const, value: "https://precisionmech.com/careers" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Industrial Engineering Intern",
    company: "FlowOpt Logistics",
    industry: "Engineering",
    jobType: "INTERNSHIP" as const,
    description: "Improve workflow efficiency through time studies and process mapping.",
    skills: ["Lean Principles", "Excel", "Process Mapping", "Problem Solving"],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "ie-intern@flowopt.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Marketing Coordinator",
    company: "Vivid Creative",
    industry: "Marketing",
    jobType: "FULL_TIME" as const,
    description: "Coordinate campaigns and manage content across multiple channels.",
    skills: ["Copywriting", "Social Media Tools", "Creativity", "Organization"],
    deadline: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "marketing@vividcreative.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Content Marketing Intern",
    company: "BrandLift Media",
    industry: "Marketing",
    jobType: "INTERNSHIP" as const,
    description: "Support content team in writing blog posts and social media content.",
    skills: ["Writing", "SEO Basics", "Creativity", "Time Management"],
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "content@brandlift.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Sales Development Representative",
    company: "LeadFlow",
    industry: "Sales",
    jobType: "FULL_TIME" as const,
    description: "Generate and qualify leads through outreach and demos.",
    skills: ["Communication", "CRM Tools", "Resilience", "Negotiation"],
    deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE" as const, value: "https://leadflow.com/jobs" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Business Development Intern",
    company: "GrowthEdge",
    industry: "Sales",
    jobType: "INTERNSHIP" as const,
    description: "Identify potential clients and support research efforts.",
    skills: ["Research", "Outreach", "CRM Basics", "Collaboration"],
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "bd-intern@growthedge.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Financial Analyst",
    company: "Summit Financial",
    industry: "Finance",
    jobType: "FULL_TIME" as const,
    description: "Perform financial analysis and create forecasting models.",
    skills: ["Excel", "Financial Modeling", "Accounting Principles", "Critical Thinking"],
    deadline: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "careers@summitfinancial.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Accounting Intern",
    company: "LedgerWorks",
    industry: "Finance",
    jobType: "INTERNSHIP" as const,
    description: "Support bookkeeping and transaction recording tasks.",
    skills: ["Excel", "QuickBooks", "Attention to Detail", "Organization"],
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "accounting@ledgerworks.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "HR Coordinator",
    company: "Unity Talent",
    industry: "Human Resources",
    jobType: "FULL_TIME" as const,
    description: "Support recruiting and scheduling interview processes.",
    skills: ["People Skills", "Organization", "ATS Tools", "Confidentiality"],
    deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "CAREERS_PAGE" as const, value: "https://unitytalent.com/join-us" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "People Operations Intern",
    company: "CultureSpace",
    industry: "Human Resources",
    jobType: "INTERNSHIP" as const,
    description: "Assist HR team in surveys, onboarding, and employee engagement.",
    skills: ["Excel", "Communication", "Coordination", "Professionalism"],
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "hr-intern@culturespace.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Supply Chain Analyst",
    company: "TransLogix",
    industry: "Supply Chain",
    jobType: "FULL_TIME" as const,
    description: "Optimize supply chain operations and analyze sourcing strategies.",
    skills: ["Excel", "SAP", "Supply Chain Concepts", "Problem Solving"],
    deadline: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "jobs@translogix.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
  {
    title: "Logistics Intern",
    company: "RapidMove",
    industry: "Supply Chain",
    jobType: "INTERNSHIP" as const,
    description: "Support daily logistics operations and shipment monitoring.",
    skills: ["Communication", "Scheduling", "Data Entry", "Organization"],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    contactMethod: { type: "EMAIL" as const, value: "logistics@rapidmove.com" },
    postedBy: "admin@university.edu",
    status: "APPROVED" as const,
  },
];

// Function to seed all job postings
export async function seedJobPostings() {
  console.log('Starting to seed job postings...');

  let successCount = 0;
  let errorCount = 0;

  for (const job of mockJobPostings) {
    try {
      await GraphQLService.createJob(job);
      successCount++;
      console.log(`✓ Created: ${job.title} at ${job.company}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to create: ${job.title} at ${job.company}`, error);
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Success: ${successCount} jobs created`);
  console.log(`Errors: ${errorCount} jobs failed`);

  return { successCount, errorCount };
}

// Function to seed a specific number of jobs
export async function seedJobPostingsLimit(limit: number) {
  console.log(`Starting to seed ${limit} job postings...`);

  const jobsToSeed = mockJobPostings.slice(0, limit);
  let successCount = 0;
  let errorCount = 0;

  for (const job of jobsToSeed) {
    try {
      await GraphQLService.createJob(job);
      successCount++;
      console.log(`✓ Created: ${job.title} at ${job.company}`);
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to create: ${job.title} at ${job.company}`, error);
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Success: ${successCount} jobs created`);
  console.log(`Errors: ${errorCount} jobs failed`);

  return { successCount, errorCount };
}
