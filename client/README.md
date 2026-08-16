# CareerForge Frontend

CareerForge is a full-stack Job Recruitment and Application Management System built as a portfolio project to demonstrate practical full-stack development skills.

This directory contains the React frontend of CareerForge.

The frontend provides separate user experiences for public visitors, job seekers, recruiters, and administrators and communicates with the CareerForge backend REST API.

## Features

### Public Users

- Home page
- Browse available jobs
- Search jobs
- Filter and sort jobs
- View job details
- View company information
- View similar jobs
- Pagination

### Authentication

- User registration
- Job seeker registration
- Recruiter registration
- Email verification
- Resend email verification
- Login
- Logout
- Session restoration
- Session management
- Logout from all sessions
- Forgot password
- Reset password
- Change password
- Email change
- Protected routes
- Role-based navigation

### Job Seekers

- Job seeker dashboard
- Profile management
- Profile image management
- Education management
- Experience management
- Skills management
- Projects and certifications
- Social links
- Job preferences
- Resume and document management
- Save jobs
- Apply for jobs
- View applications
- Track application status
- Withdraw eligible applications
- View interviews
- Confirm interview attendance
- Decline interviews
- View interview history
- Manage interview rescheduling
- Receive notifications

### Recruiters

- Recruiter dashboard
- Recruiter profile management
- Company creation and management
- Company verification workflow
- Create and edit jobs
- Publish and close jobs
- View applicants
- View applicant details
- View applicant resumes
- Add recruiter notes
- Update application status
- Schedule interviews
- Reschedule interviews
- Manage interviews
- Receive notifications

### Administrators

- Administrator dashboard
- User management
- View user details
- Enable and disable users
- Company verification
- Company rejection
- Job moderation
- Remove and restore jobs
- Report management
- Audit logs
- View audit log details
- Administrative moderation workflows

## Technology Stack

- React
- Vite
- JavaScript
- React Router
- Axios
- Tailwind CSS
- Lucide React
- Sonner
- date-fns
- Vitest
- React Testing Library
- ESLint

## Project Structure

The frontend uses a feature-based folder structure.

```text
src/
|-- api/
|-- components/
|-- features/
|-- layouts/
|-- routes/
|-- tests/
|-- utils/
|-- App.jsx
`-- main.jsx
```

### Folder Overview

`api/`  
Contains shared Axios configuration and API endpoint definitions.

`components/`  
Contains reusable UI components used across the application.

`features/`  
Contains the main application features such as authentication, jobs, applications, interviews, notifications, recruiter functionality, and administrator functionality.

`layouts/`  
Contains layouts for public, authentication, job seeker, recruiter, and administrator pages.

`routes/`  
Contains application routing and protected route configuration.

`tests/`  
Contains frontend automated tests.

`utils/`  
Contains reusable utility functions.

`App.jsx`  
Provides the main application setup and global providers.

`main.jsx`  
Starts and renders the React application.

## API Integration

The frontend communicates with the CareerForge backend through Axios.

The backend API URL is configured using:

```text
VITE_API_BASE_URL
```

Requests that require cookie-based authentication use Axios with:

```text
withCredentials: true
```

This allows the browser to send the secure HTTP-only refresh-token cookie when required.

## Local Setup

### 1. Install Dependencies

```bash
npm ci
```

### 2. Configure Environment Variables

Use `.env.example` as the reference for local configuration.

Example:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

Do not commit real secrets or private environment configuration to Git.

### 3. Start the Frontend

```bash
npm run dev
```

The frontend requires the CareerForge backend to be running and correctly configured.

## Available Commands

Start development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Run frontend tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Authentication and Security

The frontend works with the authentication and security features provided by the CareerForge backend.

Important frontend security behavior includes:

- Protected routes
- Role-based route access
- Session restoration
- Secure HTTP-only refresh-token cookies
- Authenticated API requests
- Logout and session management
- Account-status handling
- Environment-based API configuration

Passwords and refresh tokens are not manually stored in browser `localStorage` or `sessionStorage`.

## Testing

Automated frontend tests cover important areas such as:

- Authentication
- Routing
- Route guards
- Public jobs
- Job seeker functionality
- Recruiter functionality
- Applications
- Interviews
- Notifications
- Administrator functionality
- API integration
- Form validation
- Utilities
- Responsive navigation
- Accessibility behavior

Current verified frontend test result:

```text
59/59 test files passed
225/225 tests passed
ESLint passed
Production build passed
```

## CI/CD

GitHub Actions is used to automatically check the frontend code.

The frontend CI process includes:

1. Installing dependencies
2. Running ESLint
3. Running automated tests
4. Creating a production build

The workflow runs for pushes to `main` and pull requests targeting `main`.

The production frontend is deployed through Vercel from the `main` branch.

## Production Deployment

The CareerForge frontend is deployed on Vercel.

Production application:

https://job-recruitment-and-application-man.vercel.app

The production frontend communicates with the deployed CareerForge backend using environment-based API configuration.

The project also contains:

```text
vercel.json
```

This configuration supports frontend routes when users directly open or refresh application pages.

## Project Status

The CareerForge frontend is complete for the planned project scope.

Completed areas include:

- Frontend implementation
- Backend API integration
- Authentication
- Job seeker workflows
- Recruiter workflows
- Administrator workflows
- Responsive design
- Accessibility improvements
- Automated testing
- Production build
- CI/CD
- Production deployment

## Related Documentation

For complete project and backend information, see:

```text
../README.md
../server/README.md
../server/src/docs/
```

## About This Project

CareerForge was built as a full-stack portfolio project to apply and demonstrate practical development concepts including React application development, REST API integration, authentication, role-based access, testing, deployment, and CI/CD.

The project is designed to demonstrate skills relevant to entry-level and junior full-stack software development roles.