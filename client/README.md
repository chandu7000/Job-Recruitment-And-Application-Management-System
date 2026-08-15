# CareerForge Frontend

CareerForge is a full-stack Job Recruitment and Application Management System designed to support the complete recruitment lifecycle for job seekers, recruiters, administrators, and public visitors.

This directory contains the React frontend for CareerForge.

## Frontend Overview

The CareerForge frontend provides role-based interfaces and workflows for:

- Public visitors
- Job seekers
- Recruiters
- Administrators

The application communicates with the CareerForge REST API and provides responsive interfaces for authentication, job discovery, applications, interviews, notifications, recruiter workflows, and administrative moderation.

## Technology Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Sonner
- date-fns
- Vitest
- React Testing Library
- ESLint

## Frontend Structure

The CareerForge frontend follows a feature-oriented structure that separates application domains while keeping shared infrastructure reusable.

```text
src/
├── api/
├── components/
├── features/
├── layouts/
├── routes/
├── tests/
├── utils/
├── App.jsx
└── main.jsx
```

### `api/`

Contains shared API configuration, endpoint definitions, HTTP client behavior, and API-related infrastructure used by frontend features.

### `components/`

Contains reusable UI components shared across multiple areas of the application.

### `features/`

Contains feature-oriented modules for the major CareerForge domains, including:

- Authentication and account management
- Public jobs
- Job seeker workflows
- Recruiter workflows
- Applications
- Interviews
- Notifications
- Administrator functionality

Feature modules keep related pages, components, API logic, validation, constants, contexts, and utilities close to their respective application domain.

### `layouts/`

Contains layout components that provide consistent navigation and page structure for public, authenticated, job-seeker, recruiter, and administrator areas.

### `routes/`

Contains application routing configuration, protected-route behavior, role-based route handling, and navigation structure.

### `tests/`

Contains automated frontend tests covering pages, components, API modules, routing, authentication, validation, utilities, and role-based workflows.

### `utils/`

Contains reusable frontend utility functions shared across application features.

### Application Entry Points

`main.jsx` initializes and renders the React application.

`App.jsx` provides application-level providers and renders the main router, including authentication, notifications, and global toast behavior.

## Frontend Design Principles

The frontend structure follows these principles:

- Feature-oriented organization
- Reusable shared components
- Centralized API communication
- Role-based routing and authorization
- Separation of page, API, validation, and utility concerns
- Shared application providers
- Automated testing across frontend functionality
- Environment-based backend configuration

## Major Features

### Public

- Home page
- Public job listings
- Job search
- Filtering and sorting
- Pagination
- Job details
- Company information
- Similar jobs

### Authentication and Account

- Registration
- Email verification
- Resend verification
- Login
- Session restoration
- Logout
- Logout from all sessions
- Session management
- Forgot password
- Reset password
- Change password
- Email change
- Protected routes
- Role-based route access

### Job Seeker

- Dashboard
- Profile management
- Profile image management
- Resume and document management
- Job preferences
- Saved jobs
- Job applications
- Application details and tracking
- Application withdrawal
- Application history
- Interview management
- Attendance confirmation
- Interview decline
- Interview rescheduling
- Notifications

### Recruiter

- Dashboard
- Recruiter profile
- Company management
- Company verification workflow
- Job creation and editing
- Job publishing and closing
- Job management
- Applicant management
- Applicant details
- Resume viewing
- Recruiter notes
- Application status management
- Interview scheduling
- Interview rescheduling
- Interview management and history

### Administrator

- Dashboard
- User management
- User details
- User enable/disable actions
- Job moderation
- Job removal and restoration
- Report management
- Company verification and rejection
- Audit logs
- Audit log details
- Moderation workflows

## Local Setup

Install frontend dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The frontend requires the CareerForge backend API to be available and correctly configured.

## Environment Configuration

Create the required local environment configuration using the provided example file as the reference:

```text
.env.example
```

The frontend API base URL is configured through:

```text
VITE_API_BASE_URL
```

```markdown
API requests that require cookie-based session handling use the shared Axios client with `withCredentials: true`, allowing the browser to send the secure HTTP-only refresh-token cookie to the backend.

Do not commit real environment files, credentials, tokens, API keys, or other secrets to source control.

## Quality Commands

Run ESLint:

```bash
npm run lint
```

Run the automated frontend test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## CI/CD

Frontend continuous integration is configured with GitHub Actions.

The CI workflow performs:

1. Dependency installation
2. ESLint validation
3. Automated frontend tests
4. Production build validation

CI runs for pushes to `main` and pull requests targeting `main`.

## Production Deployment

The frontend is deployed using Vercel.

Production frontend:

```text
https://job-recruitment-and-application-man.vercel.app
```

The Vercel Production environment tracks the `main` branch.

The production frontend communicates with the deployed CareerForge backend API through environment-based configuration.

SPA routing configuration is maintained through:

```text
vercel.json
```

This allows direct navigation and browser refreshes on frontend application routes.

## Security Notes

- Authentication is handled through the CareerForge backend.
- Access tokens and session behavior follow the application's established authentication flow.
- Refresh tokens are handled using secure HTTP-only cookies.
- Frontend route guards enforce authenticated and role-based navigation.
- Environment-specific configuration is kept outside source control.
- Real secrets must remain outside the Git repository.

## Testing

The frontend contains automated tests covering major application areas including:

- Authentication
- Routing
- Route guards
- Public job functionality
- Job seeker workflows
- Recruiter workflows
- Applications
- Interviews
- Notifications
- Administrator functionality
- API integration
- Validation
- Utilities

The established frontend quality gate is:

```text
58/58 test files passed
224/224 tests passed
ESLint passed
Production build passed
```

## Project Context

This frontend is part of the complete CareerForge Job Recruitment and Application Management System.

Additional project-wide architecture, backend setup, deployment details, API integration documentation, testing documentation, security information, and handover information are maintained at the repository level.

See:

```text
../README.md
../server/README.md
../server/src/docs/
```