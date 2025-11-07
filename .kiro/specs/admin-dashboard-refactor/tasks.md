# Implementation Plan

- [x] 1. Refactor Navigation component to clean up admin tabs
  - Remove "Pending Approvals", "Platform Settings", and "Edit by ID" tabs from admin navigation
  - Add "DawgsConnect" tab pointing to /dashboard for admin users
  - Add "My Profile" tab pointing to /profile for admin users
  - Update tab structure to match design specification
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 5.1_

- [x] 2. Refactor AdminDashboard component to focus on job management
  - Remove Users & Roles section from AdminDashboard.tsx
  - Remove Platform Settings section from AdminDashboard.tsx
  - Update AdminDashboard.css to match StudentDashboard.css styling patterns
  - Ensure border-radius is 12px for cards and tables
  - Apply UGA red (#ba0c2f) for primary buttons
  - Verify typography and spacing matches student dashboard
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3_

- [x] 3. Create UsersRolesPage component for user management
- [x] 3.1 Create UsersRolesPage.tsx component file
  - Implement component with Navigation, page header, and user table
  - Add loading state with spinner
  - Add error state with retry button
  - Add empty state for no users
  - Call listUsersAdmin() from adminService to fetch users
  - Display users in table with name, email, and role columns
  - _Requirements: 3.1, 3.4_

- [x] 3.2 Implement role management functionality
  - Add role dropdown selector for each user row
  - Implement role change handler calling updateUserRoleAdmin()
  - Refresh user list after role update
  - Add success/error feedback for role updates
  - _Requirements: 3.2, 3.3_

- [x] 3.3 Create UsersRolesPage.css stylesheet
  - Apply styling consistent with AdminDashboard and StudentDashboard patterns
  - Use table-card class for table container
  - Implement responsive design for mobile devices
  - Match color scheme and typography
  - _Requirements: 3.4_

- [x] 4. Add UsersRolesPage route to App.tsx
  - Add route for /admin/users pointing to UsersRolesPage
  - Wrap route with ProtectedRoute component
  - Verify route is accessible only to authenticated users
  - _Requirements: 3.1_

- [x] 5. Refactor EditJobPage to match MyJobPostingsPage pattern
- [x] 5.1 Update EditJobPage form structure
  - Restructure form to match EditJobModal from MyJobPostingsPage
  - Add industry field (text input)
  - Add jobType field (select dropdown)
  - Add skills field (dynamic list with add/remove functionality)
  - Add contactMethod field (type selector + value input)
  - Implement two-column layout for related fields
  - _Requirements: 6.1, 6.2_

- [x] 5.2 Implement skills management in EditJobPage
  - Add skillInput state for new skill entry
  - Implement handleAddSkill function
  - Implement handleRemoveSkill function
  - Display skills as removable tags
  - _Requirements: 6.2_

- [x] 5.3 Implement contact method handling in EditJobPage
  - Add contact method type dropdown (EMAIL, CAREERS_PAGE)
  - Add contact method value input
  - Implement handleContactMethodChange function
  - Validate contact method based on type
  - _Requirements: 6.2_

- [x] 5.4 Update EditJobPage save and delete handlers
  - Update save handler to include all new fields
  - Ensure proper data mapping to backend format
  - Navigate to /admin after successful save
  - Confirm before delete and navigate to /admin after deletion
  - _Requirements: 6.3, 6.4_

- [x] 5.5 Create/update EditJobPage.css to match MyJobPostingsPage modal styles
  - Apply modal-content styling patterns
  - Style form-group and form-row classes
  - Style skills input and tags
  - Style contact method inputs
  - Match button styles and spacing
  - Implement responsive design
  - _Requirements: 6.5_

- [ ] 6. Verify admin access to student-facing features
  - Test admin navigation to /dashboard (DawgsConnect)
  - Verify admin can view approved job postings on student dashboard
  - Test admin navigation to /profile (My Profile)
  - Verify all navigation tabs work correctly for admin role
  - _Requirements: 4.1, 4.2, 5.1, 5.2_
