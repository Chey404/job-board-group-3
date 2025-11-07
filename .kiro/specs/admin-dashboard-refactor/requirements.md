# Requirements Document

## Introduction

This feature refactors the admin dashboard functionality that was merged in an unfinished state. The goal is to clean up the UI, remove unnecessary navigation items, create a dedicated Users & Roles management page, ensure admin users can access student-facing features, and align the edit job page with the existing My Job Postings pattern.

## Glossary

- **Admin Dashboard**: The main administrative interface where admins can manage job postings, users, and platform settings
- **Navigation Component**: The shared navigation bar component used across all pages that displays role-appropriate tabs
- **Edit Job Page**: The page where admins can edit job posting details
- **My Job Postings Page**: The existing page where company representatives manage their job postings with an inline edit modal
- **Users & Roles Page**: A new dedicated page for viewing all registered users and managing their roles
- **Student Dashboard**: The main job board interface that students use to browse job postings

## Requirements

### Requirement 1

**User Story:** As an admin, I want the admin dashboard UI to match the current application styling, so that the interface feels cohesive and professional

#### Acceptance Criteria

1. WHEN THE Admin Dashboard renders, THE System SHALL apply CSS styling that matches the StudentDashboard.css patterns for layout, colors, typography, and spacing
2. WHEN THE Admin Dashboard displays cards and tables, THE System SHALL use border-radius values of 12px and box-shadow values matching the student dashboard empty-state style
3. WHEN THE Admin Dashboard displays buttons, THE System SHALL use the UGA red color (#ba0c2f) for primary actions matching the existing brand guidelines

### Requirement 2

**User Story:** As an admin, I want unnecessary navigation tabs removed, so that I only see relevant administrative functions

#### Acceptance Criteria

1. WHEN THE Navigation Component renders for an admin user, THE System SHALL exclude the "Pending Approvals" tab from the navigation bar
2. WHEN THE Navigation Component renders for an admin user, THE System SHALL exclude the "Platform Settings" tab from the navigation bar
3. WHEN THE Navigation Component renders for an admin user, THE System SHALL exclude the "Edit by ID" tab from the navigation bar

### Requirement 3

**User Story:** As an admin, I want a dedicated Users & Roles page, so that I can view all registered users and manage their roles in a clean interface

#### Acceptance Criteria

1. WHEN AN admin navigates to the Users & Roles page, THE System SHALL display a table showing all registered users with columns for name, email, and current role
2. WHEN THE Users & Roles page displays a user row, THE System SHALL provide a dropdown selector to change the user's role between STUDENT, COMPANY, and ADMIN
3. WHEN AN admin changes a user's role via the dropdown, THE System SHALL update the user's role in the backend and refresh the user list
4. WHEN THE Users & Roles page is accessed, THE System SHALL apply styling consistent with the admin dashboard and student dashboard patterns

### Requirement 4

**User Story:** As an admin, I want to access the DawgsConnect student dashboard, so that I can see what students see and verify job postings are displaying correctly

#### Acceptance Criteria

1. WHEN THE Navigation Component renders for an admin user, THE System SHALL include a "DawgsConnect" tab that navigates to the student dashboard at /dashboard
2. WHEN AN admin clicks the DawgsConnect tab, THE System SHALL display the student job board with all approved job postings

### Requirement 5

**User Story:** As an admin, I want to access the My Profile tab, so that I can manage my own profile information

#### Acceptance Criteria

1. WHEN THE Navigation Component renders for an admin user, THE System SHALL include a "My Profile" tab in the navigation bar
2. WHEN AN admin clicks the My Profile tab, THE System SHALL navigate to the /profile route

### Requirement 6

**User Story:** As an admin, I want the edit job page to follow the My Job Postings pattern, so that the editing experience is consistent with the existing company representative workflow

#### Acceptance Criteria

1. WHEN THE Edit Job Page loads a job posting, THE System SHALL display the job details in a form layout matching the EditJobModal component from MyJobPostingsPage
2. WHEN THE Edit Job Page displays form fields, THE System SHALL include all fields present in the My Job Postings edit modal including title, company, industry, jobType, deadline, description, skills, and contactMethod
3. WHEN AN admin saves changes on the Edit Job Page, THE System SHALL update the job posting and navigate back to the admin dashboard
4. WHEN AN admin deletes a job on the Edit Job Page, THE System SHALL prompt for confirmation, delete the job posting, and navigate back to the admin dashboard
5. WHEN THE Edit Job Page renders, THE System SHALL apply CSS styling matching the MyJobPostingsPage.css modal styles for consistency

### Requirement 7

**User Story:** As an admin, I want the admin dashboard to focus on job management, so that I can efficiently review and manage job postings without clutter

#### Acceptance Criteria

1. WHEN THE Admin Dashboard renders, THE System SHALL display the job postings table with filters for search, company, creator, status, and date range
2. WHEN THE Admin Dashboard renders, THE System SHALL exclude the Platform Settings section from the page
3. WHEN THE Admin Dashboard renders, THE System SHALL exclude the Users & Roles section from the page since it now has a dedicated page
