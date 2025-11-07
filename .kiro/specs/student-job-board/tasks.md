# Implementation Plan

- [x] 1. Setup Amplify Gen 2 with GraphQL API and DynamoDB Infrastructure
  - [x] 1.1 Configure Amplify Gen 2 data schema in amplify/data/resource.ts
    - Define User model with cognitoId (primary key), role, phoneNumber, graduationYear (students), companyName (company reps), jobTitle (company reps), industry (company reps), createdAt, updatedAt
    - Define JobPosting model with all required fields (title, company, industry, jobType, description, skills, deadline, contactMethod, postedBy, status)
    - ContactMethod should include type (email or careers_page) and value (email address or URL)
    - Set up relationships: User hasMany JobPostings (no Application model needed)
    - Add GSI indexes for role-based queries and efficient job filtering
    - _Requirements: 6.1, 9.1, 9.4_

  - [x] 1.2 Deploy GraphQL API and DynamoDB backend with Amplify Gen 2
    - Run npx ampx sandbox to deploy schema to AWS
    - Configure DynamoDB tables with proper GSI indexes for role-based queries
    - Set up GraphQL resolvers and mutations for CRUD operations
    - Test API endpoints using GraphQL playground or Amplify console
    - _Requirements: 8.4_

  - [x] 1.3 Update frontend code to replace mock data with GraphQL API calls
    - Install and configure Amplify Gen 2 client libraries
    - Replace mock job data in JobBoard component with GraphQL queries
    - Update JobCard component to use real job posting data from API
    - Modify JobFilters to work with GraphQL filtering and search operations
    - Update all components to handle loading states and API errors properly
    - _Requirements: 2.1, 2.2, 2.6_

- [x] 2. Set up Amplify Gen 2 authentication with Cognito
  - [x] 2.1 Configure Amplify Auth in amplify/auth/resource.ts
    - Set up Cognito User Pool with email as username
    - Configure password requirements and email verification
    - Keep Cognito attributes minimal: email, firstName, lastName, phoneNumber
    - Set up sign-in and sign-up flows to match existing UI
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Update existing SignInPage.tsx to use Amplify Auth
    - Integrate existing SignInPage.tsx form with Amplify Auth signIn function
    - Maintain existing form validation and error messaging
    - Keep current professional styling and accessibility features
    - Add proper error handling for Cognito authentication errors
    - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.5_

  - [x] 2.3 Update existing CreateAccountPage.tsx to match schema and integrate with Cognito
    - Modify existing CreateAccountPage.tsx to include universal fields: firstName, lastName, email, phoneNumber, password, role selection
    - Add conditional fields based on role selection:
      - Students: graduationYear (required)
      - Company Representatives: companyName, jobTitle, industry (all required)
      - Admin: no additional fields required
    - Keep existing MIS-specific welcome messaging and branding
    - Connect to Amplify Auth signUp function for authentication (stores basic info in Cognito)
    - After successful Cognito signup, create User record in DynamoDB with role-specific extended data
    - Implement email verification flow
    - _Requirements: 9.1, 9.4, 10.1_

  - [x] 2.4 Implement authentication context with hybrid approach
    - Create AuthContext using Amplify Auth getCurrentUser for authentication status
    - Fetch extended user profile data from DynamoDB User table using Cognito sub as key
    - Add role determination logic from DynamoDB User record
    - Implement sign-out functionality using Amplify Auth signOut
    - Add protected route wrapper that checks both Cognito auth and DynamoDB user profile
    - Handle authentication state changes and session management
    - _Requirements: 1.6, 7.2, 8.5_

- [ ] 3. Implement role-based navigation and UI
  - [ ] 3.1 Create role-based navigation system
    - Build Navigation component with conditional menu items based on user role
    - Student role: Show "DawgsConnect", "My Profile" tabs only
    - Company Representative role: Show "Create Job Posting", "My Job Postings", "My Profile" tabs
    - Admin role: Show all tabs including "DawgsConnect", "Create Job Posting", "User Management", "My Profile"
    - Implement mobile-responsive navigation with hamburger menu
    - _Requirements: 7.1, 7.2_

  - [ ] 3.2 Build role-specific dashboard pages
    - Create StudentDashboard with job browsing (DawgsConnect page)
    - Create CompanyRepresentativeDashboard with overview of their job postings and quick stats
    - Create AdminDashboard with platform overview, pending approvals, user management, and full access
    - Add navigation to "My Job Postings" for company representatives
    - Add navigation to approval queue and analytics for admins
    - Implement route protection to prevent unauthorized access based on user role
    - _Requirements: 1.4, 7.5_

  - [ ] 3.3 Implement My Profile page for all roles
    - Create universal profile page with role-specific fields
    - Display Cognito data (firstName, lastName, email, phoneNumber) and DynamoDB data (role-specific fields)
    - Students: name, email, phone, graduation year
    - Company Representatives: name, email, phone, company name, job title, industry, posted jobs count
    - Admin: name, email, phone, platform statistics
    - Add profile editing functionality that updates DynamoDB records
    - _Requirements: 8.5_

- [ ] 4. Build job posting and management features
  - [ ] 4.1 Update existing CreateJobPage.tsx to integrate with GraphQL API
    - Modify existing CreateJobPage.tsx to match JobPosting schema model
    - Ensure all required fields are present and properly validated
    - Update contact method selection to support "Email" or "Company Career Page"
    - For Email: input field for recruiter email address
    - For Career Page: input field for company application URL
    - Connect existing form to GraphQL API for job creation
    - Automatically record the user email who created the posting in postedBy field
    - Maintain existing styling and user experience
    - _Requirements: 3.2, 6.1, 6.4_

  - [ ] 4.2 Implement job approval workflow
    - Add job status field (draft, pending, approved, archived) to JobPosting model
    - Admin jobs are auto-approved, company representative jobs require admin approval
    - Create approval queue interface for admin users showing job details and creator information
    - Display job creator's name, email, and company information in approval interface
    - Add approve/reject functionality with optional admin comments
    - Add in-app notifications for approval status changes (no email for MVP)
    - _Requirements: 6.4, 6.5_

  - [x] 4.3 Build job management interface for company representatives
    - Create "My Job Postings" page for company representatives to view only their own postings
    - Display job postings with status indicators (draft, pending approval, approved, archived)
    - Add edit functionality for job postings that creates new pending approval when edited
    - Implement job archiving when deadline passes or manual archiving
    - Add job performance metrics (views, application clicks) for each posting
    - Show approval status and admin comments if job was rejected
    - _Requirements: 3.4, 3.5, 6.5, 6.6_

  - [ ] 4.4 Build admin job management interface
    - Create admin "All Job Postings" page showing jobs from all users
    - Display job creator information (name, email, company) for each posting
    - Add filtering by job status, creator, and date range
    - Include bulk approval/rejection functionality for multiple jobs
    - Add job performance analytics across all postings
    - Implement job deletion capability (admin only)
    - _Requirements: 3.4, 3.5, 6.5, 6.6_

- [ ] 5. Implement external application functionality
  - [ ] 5.1 Add external application buttons to job cards
    - Create "Apply" button on job cards that opens external link (email or career page)
    - For email contact method: open mailto link with job title in subject
    - For career page contact method: open URL in new tab/window
    - Add click tracking for analytics (optional)
    - _Requirements: 2.4_

- [ ] 6. Add admin user management features
  - [ ] 6.1 Create user management interface for admins
    - Build user listing with role-based filtering
    - Add user role assignment and modification capabilities
    - Implement user account activation/deactivation
    - Add user search and pagination
    - _Requirements: 5.2_

  - [ ] 6.2 Build admin analytics dashboard
    - Display platform statistics (total users, active jobs, archived jobs, pending approvals)
    - Show engagement metrics (job views, external application link clicks)
    - Add job posting analytics by creator showing top posting companies/representatives
    - Display recent job posting activity with creator information
    - Add charts for user growth and job posting trends by user type
    - Show approval workflow metrics (average approval time, rejection rates)
    - Implement real-time updates for platform activity
    - _Requirements: 5.1, 5.4_

- [ ] 7. Enhance user experience and error handling
  - [ ] 7.1 Implement comprehensive error handling
    - Create global error boundary for unexpected errors
    - Add specific error handling for GraphQL API failures
    - Implement retry mechanisms for failed operations
    - Create user-friendly error messages and recovery options
    - _Requirements: 1.5, 8.5_

  - [ ] 7.2 Add loading states and notifications
    - Add loading spinners for all API operations
    - Create skeleton screens for content loading
    - Implement toast notifications for success/error messages
    - Add confirmation dialogs for destructive actions
    - _Requirements: 8.5_

- [ ] 8. Implement job editing and re-approval workflow
  - [ ] 8.1 Create job editing functionality for company representatives
    - Add edit button to job postings in "My Job Postings" page
    - Create job edit form pre-populated with existing job data
    - When job is edited, automatically set status back to "pending" for admin re-approval
    - Maintain edit history and track who made changes and when
    - Prevent editing of jobs that are currently under review
    - Add validation to ensure all required fields remain populated
    - _Requirements: 3.4, 6.4, 6.5_

  - [ ] 8.2 Build admin approval interface for edited jobs
    - Create comparison view showing original vs edited job details
    - Highlight changed fields for easy admin review
    - Add approve/reject functionality with admin comments
    - Track approval history for each job posting
    - Send status notifications back to job creator
    - Implement bulk approval for multiple edited jobs
    - _Requirements: 6.4, 6.5_

- [x] 9. Create detailed job posting view page
  - [x] 9.1 Build JobDetailPage component with comprehensive job information display
    - Create new JobDetailPage.tsx component that displays full job posting details
    - Include all job information: title, company, industry, job type, full description, complete skills list, deadline, contact method
    - Add professional styling with clear information hierarchy and readable typography
    - Display company information and job posting metadata (posted date, view count)
    - Include breadcrumb navigation back to job listings
    - Implement responsive design for mobile and desktop viewing
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 9.2 Update JobCard component to navigate to detailed view
    - Modify existing JobCard "Apply Now" button to navigate to detailed job view instead of direct external application
    - Add new route `/job/:id` for individual job postings using React Router
    - Update StudentDashboard to handle navigation to job detail pages
    - Implement proper URL structure for job detail pages with job ID parameter
    - Add loading states and error handling for job detail page data fetching
    - _Requirements: 2.4_

  - [x] 9.3 Add application functionality to detailed job view
    - Create prominent "Apply for this Position" button on job detail page
    - For email contact method: just display email
    - For career page contact method: open company application URL in new tab/window
    - Add application tracking by incrementing job's applicationCount when apply button is clicked
    - Include clear application instructions and contact information display
    - Add "Back to Jobs" navigation button for easy return to job listings
    - _Requirements: 2.4_