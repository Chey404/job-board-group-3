# Design Document

## Overview

This design refactors the admin dashboard to provide a clean, focused administrative experience. The refactoring removes clutter from the main admin dashboard, creates a dedicated Users & Roles management page, ensures admins can access student-facing features, and aligns the edit job page with the established My Job Postings pattern for consistency.

The design leverages existing components and services while reorganizing the UI to be more intuitive and maintainable.

## Architecture

### Component Structure

```
src/
├── pages/
│   ├── AdminDashboard.tsx (refactored - job management only)
│   ├── EditJobPage.tsx (refactored - matches MyJobPostingsPage pattern)
│   └── UsersRolesPage.tsx (new - dedicated user management)
├── components/
│   └── Navigation.tsx (refactored - cleaned up admin tabs)
├── services/
│   └── adminService.ts (existing - no changes needed)
└── App.tsx (updated - add UsersRolesPage route)
```

### Page Responsibilities

1. **AdminDashboard**: Job posting management with filters, sorting, and status updates
2. **UsersRolesPage**: User listing and role management
3. **EditJobPage**: Individual job editing following MyJobPostingsPage modal pattern
4. **Navigation**: Role-based tab rendering with cleaned admin options

## Components and Interfaces

### 1. Navigation Component Refactoring

**Purpose**: Simplify admin navigation by removing unnecessary tabs and adding student-facing access

**Changes**:
- Remove "Pending Approvals" tab (filtering can be done on main admin dashboard)
- Remove "Platform Settings" tab (feature not needed in current scope)
- Remove "Edit by ID" tab (can navigate directly from job table)
- Add "DawgsConnect" tab pointing to /dashboard
- Add "My Profile" tab pointing to /profile
- Keep "Manage Jobs" tab pointing to /admin

**Admin Tab Structure**:
```typescript
{
  id: 'dawgs-connect',
  label: 'DawgsConnect',
  route: '/dashboard',
  roles: ['ADMIN']
},
{
  id: 'manage-jobs',
  label: 'Manage Jobs',
  route: '/admin',
  roles: ['ADMIN']
},
{
  id: 'users-roles',
  label: 'Users & Roles',
  route: '/admin/users',
  roles: ['ADMIN']
},
{
  id: 'create-job',
  label: 'Create Job Post',
  route: '/create-job',
  roles: ['ADMIN']
},
{
  id: 'profile',
  label: 'My Profile',
  route: '/profile',
  roles: ['ADMIN']
}
```

### 2. AdminDashboard Component Refactoring

**Purpose**: Focus solely on job posting management

**Sections to Keep**:
- Filters section (search, company, creator, status, date range)
- Job postings table with sortable columns
- Action buttons (Approve, Archive, Edit, Remove)

**Sections to Remove**:
- Users & Roles section (moved to dedicated page)
- Platform Settings section (not needed)

**Styling Updates**:
- Ensure all CSS matches StudentDashboard.css patterns
- Use consistent border-radius (12px), box-shadow, and color scheme
- Apply UGA red (#ba0c2f) for primary buttons
- Match typography and spacing from student dashboard

**Data Flow**:
```
AdminDashboard
  ↓
listJobsAdmin(filters) → adminService
  ↓
GraphQLService.getApprovedJobs() / listAllJobs()
  ↓
Filter & map to AdminJob[]
  ↓
Display in sortable table
```

### 3. UsersRolesPage Component (New)

**Purpose**: Dedicated page for viewing and managing user roles

**Component Structure**:
```typescript
interface UsersRolesPageProps {}

interface UsersRolesPageState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}
```

**Layout**:
- Page header with title "Users & Roles"
- Table displaying all users with columns:
  - Name
  - Email
  - Current Role
  - Role Selector (dropdown)
- Loading state with spinner
- Error state with retry button
- Empty state if no users

**Data Flow**:
```
UsersRolesPage
  ↓
listUsersAdmin() → adminService
  ↓
GraphQL query (or fallback to empty array)
  ↓
Display in table with role dropdowns
  ↓
updateUserRoleAdmin(id, role) on change
  ↓
Refresh user list
```

**Styling**:
- Follow AdminDashboard.css and StudentDashboard.css patterns
- Use table-card class for consistent card styling
- Apply responsive design for mobile devices

### 4. EditJobPage Component Refactoring

**Purpose**: Align edit job experience with MyJobPostingsPage modal pattern

**Current Issues**:
- Form layout doesn't match MyJobPostingsPage
- Missing fields (skills, contactMethod, industry, jobType)
- Inconsistent styling

**Target Structure** (based on MyJobPostingsPage EditJobModal):
```typescript
interface EditJobPageState {
  formData: JobPosting | null;
  saving: boolean;
  skillInput: string;
}
```

**Form Fields** (matching MyJobPostingsPage):
- Job Title (text input)
- Company (text input)
- Industry (text input)
- Job Type (select: INTERNSHIP, FULL_TIME, CONTRACT)
- Application Deadline (date input)
- Description (textarea)
- Required Skills (dynamic list with add/remove)
- Contact Method (type selector + value input)
- Status (select: PENDING, APPROVED, ARCHIVED) - admin only

**Layout**:
- Two-column form layout for related fields
- Full-width fields for title, description
- Skills input with add button and removable tags
- Contact method with type dropdown and value input
- Action buttons: Save, Cancel, Delete

**Styling**:
- Use MyJobPostingsPage.css modal styles as reference
- Apply consistent form-group, form-row classes
- Match button styles and spacing
- Responsive design for mobile

**Data Flow**:
```
EditJobPage
  ↓
getJobAdmin(id) → adminService
  ↓
GraphQLService.getJobById(id)
  ↓
Map to form state
  ↓
User edits form
  ↓
updateJobAdmin(formData) → adminService
  ↓
GraphQLService.updateJob(id, updates)
  ↓
Navigate back to /admin
```

## Data Models

### AdminJob (existing)
```typescript
type AdminJob = {
  id: string;
  title: string;
  companyName: string;
  description?: string | null;
  postedDate?: string | null;
  reviewedDate?: string | null;
  expirationDate?: string | null;
  status: "PENDING" | "APPROVED" | "ARCHIVED";
  creator?: string | null;
};
```

### AdminUser (existing)
```typescript
type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "STUDENT" | "COMPANY" | "ADMIN";
};
```

### JobPosting (existing - used in EditJobPage)
```typescript
interface JobPosting {
  id: string;
  title: string;
  company: string;
  industry: string;
  jobType: 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT';
  description: string;
  skills: string[];
  deadline: string;
  contactMethod: ContactMethod;
  postedBy: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ARCHIVED';
  viewCount: number;
  applicationCount: number;
  adminComments?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Routing Updates

### New Route
```typescript
<Route 
  path="/admin/users" 
  element={
    <ProtectedRoute>
      <UsersRolesPage />
    </ProtectedRoute>
  } 
/>
```

### Existing Routes (no changes)
- `/admin` → AdminDashboard
- `/admin/jobs/:id` → EditJobPage
- `/dashboard` → StudentDashboard (accessible by admins)
- `/profile` → Profile page (placeholder, accessible by admins)

## Error Handling

### AdminDashboard
- Display loading spinner while fetching jobs
- Show error message if job fetch fails with retry button
- Handle empty state with friendly message
- Confirm before deleting jobs

### UsersRolesPage
- Display loading spinner while fetching users
- Show error message if user fetch fails with retry button
- Handle empty state (no users) with informative message
- Show success/error feedback when updating roles

### EditJobPage
- Display loading spinner while fetching job details
- Show error message if job not found
- Validate required fields before saving
- Confirm before deleting job
- Show success message after save
- Handle navigation errors gracefully

## Testing Strategy

### Unit Testing Focus
- Navigation component renders correct tabs for admin role
- AdminDashboard filters jobs correctly
- UsersRolesPage updates user roles correctly
- EditJobPage validates form fields

### Integration Testing Focus
- Admin can navigate between all admin pages
- Admin can access student dashboard
- Job editing flow works end-to-end
- User role updates persist correctly

### Manual Testing Checklist
1. Verify admin navigation shows only: DawgsConnect, Manage Jobs, Users & Roles, Create Job Post, My Profile
2. Verify admin dashboard displays only job management section
3. Verify Users & Roles page displays all users and allows role changes
4. Verify admin can access student dashboard and see approved jobs
5. Verify edit job page matches MyJobPostingsPage styling and fields
6. Verify all styling matches StudentDashboard patterns
7. Test responsive design on mobile devices

## Design Decisions and Rationales

### Decision 1: Remove Platform Settings
**Rationale**: The platform settings feature (approval required, expiration days) is not currently needed and adds complexity. Removing it simplifies the admin experience and reduces maintenance burden.

### Decision 2: Dedicated Users & Roles Page
**Rationale**: Separating user management from job management creates a cleaner, more focused interface. Each page has a single responsibility, making the admin experience more intuitive.

### Decision 3: Match MyJobPostingsPage Pattern for Edit
**Rationale**: Consistency in editing experiences reduces cognitive load. Company reps and admins will have similar workflows when editing jobs, making the system easier to learn and use.

### Decision 4: Allow Admin Access to Student Dashboard
**Rationale**: Admins need to verify how job postings appear to students. Providing direct access to the student dashboard enables admins to QA their work without switching accounts.

### Decision 5: Remove "Edit by ID" Quick Jump
**Rationale**: The prompt-based ID entry is not a common workflow. Admins can navigate to edit pages directly from the job table, which is more intuitive and provides context.

### Decision 6: Consistent Styling Across Admin Pages
**Rationale**: Using StudentDashboard.css patterns as the foundation ensures visual consistency across the application. This creates a cohesive brand experience and reduces CSS maintenance.
