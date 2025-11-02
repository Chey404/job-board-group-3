// Mock data for development and testing
import { JobPosting, User } from '../types';

export const mockUsers: User[] = [
  {
    email: 'student@university.edu',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    phoneNumber: '555-0123',
    graduationYear: 2025,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    email: 'admin@university.edu',
    password: 'password',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    role: 'ADMIN',
    phoneNumber: '555-0456',
    createdAt: '2024-01-10T09:00:00Z',
  }
];

export const mockJobPostings: JobPosting[] = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    jobType: 'INTERNSHIP',
    description: 'Join our dynamic team as a Software Engineering Intern and gain hands-on experience with cutting-edge technologies. You will work alongside senior developers on real-world projects that impact thousands of users.',
    skills: ['JavaScript', 'React', 'Git', 'Problem Solving'],
    deadline: '2024-10-15T23:59:59Z',
    contactMethod: {
      type: 'EMAIL',
      value: 'internships@techcorp.com'
    },
    postedBy: '2',
    status: 'APPROVED',
    viewCount: 45,
    applicationCount: 12,
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-09-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Marketing Assistant',
    company: 'Creative Agency Plus',
    industry: 'Marketing & Advertising',
    jobType: 'FULL_TIME',
    description: 'We are seeking a creative and motivated Marketing Assistant to join our growing team. This role offers excellent opportunities for professional development in digital marketing and brand management.',
    skills: ['Communication', 'Social Media', 'Microsoft Office', 'Creativity'],
    deadline: '2024-10-30T23:59:59Z',
    contactMethod: {
      type: 'CAREERS_PAGE',
      value: 'https://creativeagencyplus.com/careers'
    },
    postedBy: '2',
    status: 'APPROVED',
    viewCount: 32,
    applicationCount: 8,
    createdAt: '2024-09-22T14:30:00Z',
    updatedAt: '2024-09-22T14:30:00Z'
  },
  {
    id: '3',
    title: 'Senior Full-Stack Developer with Extensive Experience in Modern Web Technologies and Cloud Architecture',
    company: 'GlobalTech Innovations International Corporation',
    industry: 'Technology & Software Development',
    jobType: 'FULL_TIME',
    description: 'We are looking for an exceptional Senior Full-Stack Developer to join our rapidly expanding engineering team. This position offers an incredible opportunity to work with cutting-edge technologies including React, Node.js, TypeScript, AWS, Docker, Kubernetes, and microservices architecture. You will be responsible for designing and implementing scalable web applications that serve millions of users worldwide. The ideal candidate will have extensive experience in both frontend and backend development, with a strong understanding of modern software engineering practices, test-driven development, continuous integration and deployment, and agile methodologies. You will collaborate closely with product managers, designers, and other engineers to deliver high-quality software solutions that meet our customers\' needs and exceed their expectations.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL', 'Jest', 'Cypress', 'Git', 'Agile', 'TDD', 'CI/CD'],
    deadline: '2024-11-30T23:59:59Z',
    contactMethod: {
      type: 'EMAIL',
      value: 'senior-developer-applications@globaltechinnovationsinternationalcorporation.com'
    },
    postedBy: '2',
    status: 'APPROVED',
    viewCount: 89,
    applicationCount: 23,
    createdAt: '2024-09-25T09:00:00Z',
    updatedAt: '2024-09-25T09:00:00Z'
  }
];

// Mock authentication function
export const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock authentication
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password123') {
    return user;
  }
  
  throw new Error('Invalid email or password');
};