# CareerForge

CareerForge is a full-stack **Job Recruitment and Application Management System** built as a portfolio project to demonstrate practical full-stack development skills.

The application supports the complete recruitment workflow for public visitors, job seekers, recruiters, and administrators.

CareerForge includes secure authentication, job discovery, company and job management, applications, interviews, notifications, file uploads, reporting, moderation, testing, CI/CD, and production deployment.

## Live Application

### Frontend

The CareerForge frontend is deployed on Vercel.

```text
https://job-recruitment-and-application-man.vercel.app
```

### Backend

The CareerForge backend is deployed on Render.

```text
https://job-recruitment-and-application.onrender.com
```

Backend health endpoint:

```text
https://job-recruitment-and-application.onrender.com/api/health
```

Backend readiness endpoint:

```text
https://job-recruitment-and-application.onrender.com/api/health/ready
```

## Application Screenshots

### Home Page

![CareerForge Home Page](docs/screenshots/01-home-page.png)

### Public Jobs

![CareerForge Public Jobs](docs/screenshots/02-public-jobs.png)

### Job Seeker Dashboard

![CareerForge Job Seeker Dashboard](docs/screenshots/03-job-seeker-dashboard.png)

### Recruiter Dashboard

![CareerForge Recruiter Dashboard](docs/screenshots/04-recruiter-dashboard.png)

### Administrator Dashboard

![CareerForge Administrator Dashboard](docs/screenshots/05-admin-dashboard.png)

## Main Features

### Public Users

- View the home page
- Browse available jobs
- Search jobs
- Filter and sort jobs
- Use pagination
- View job details
- View company information
- View similar jobs

### Authentication and Account Management

- User registration
- Job seeker and recruiter registration
- Email verification
- Resend email verification
- Login and logout
- Session restoration
- Session management
- Logout from all sessions
- Forgot password
- Reset password
- Change password
- Change email
- Protected routes
- Role-based authorization

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
- Save and unsave jobs
- Apply for jobs
- View applications
- Track application status
- View application history
- Withdraw eligible applications
- View interviews
- Confirm interview attendance
- Decline interviews
- Manage interview rescheduling
- Receive notifications

### Recruiters

- Recruiter dashboard
- Recruiter profile management
- Company creation and management
- Company verification workflow
- Create and edit jobs
- Publish and close jobs
- Manage job listings
- View applicants
- View applicant details
- View applicant resumes
- Add recruiter notes
- Update application status
- Schedule interviews
- Reschedule interviews
- Manage interview history
- Receive notifications

### Administrators

- Administrator dashboard
- User management
- View user details
- Enable and disable users
- Company verification and rejection
- Job moderation
- Remove and restore jobs
- Report management
- Audit logs
- View audit log details
- Administrative moderation

## Technology Stack

### Frontend

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

### Backend

- Node.js
- Express
- JavaScript ES Modules
- MySQL
- Sequelize
- JWT
- HTTP-only Cookies
- bcrypt
- Express Validator
- Helmet
- CORS
- Multer
- Cloudinary
- Brevo Transactional Email API
- Jest
- Supertest
- ESLint

### Development and Deployment

- Git
- GitHub
- GitHub Actions
- Vercel
- Render
- MySQL
- Cloudinary
- Brevo

## Repository Structure

```text
Job-Recruitment-And-Application-Management-System/
|-- .github/
|   `-- workflows/
|-- client/
|   |-- src/
|   |-- README.md
|   `-- vercel.json
|-- docs/
|   `-- screenshots/
|-- server/
|   |-- src/
|   `-- README.md
`-- README.md
```

### Frontend

The React/Vite frontend is located in:

```text
client/
```

Frontend documentation:

```text
client/README.md
```

### Backend

The Node.js/Express backend is located in:

```text
server/
```

Backend documentation:

```text
server/README.md
```

Additional backend API and technical documentation is available in:

```text
server/src/docs/
```

### CI/CD

GitHub Actions workflows are located in:

```text
.github/workflows/
```

## Application Architecture

CareerForge follows a client-server architecture.

```text
Browser
   |
   v
React / Vite Frontend
   |
   v
Axios
   |
   v
Express REST API
   |
   v
Controllers
   |
   v
Services
   |
   v
Repositories
   |
   v
Sequelize
   |
   v
MySQL
```

External services are used for file storage and transactional email:

```text
CareerForge Backend
       |
       |-- Cloudinary -> File and image storage
       |
       `-- Brevo -> Transactional email
```

## Authentication and Security

CareerForge includes authentication and security features across the frontend and backend.

Important security features include:

- Password hashing
- JWT access-token authentication
- HTTP-only refresh-token cookies
- Secure production cookies
- Role-based authorization
- Resource ownership validation
- Protected frontend routes
- Request validation
- CORS protection
- Trusted-origin validation
- Rate limiting
- Session management
- Session revocation
- Helmet security headers
- Administrative audit logging
- Production-safe error handling
- Environment-based secrets

Refresh tokens are handled through secure HTTP-only cookies and are not manually stored in frontend `localStorage` or `sessionStorage`.

Real passwords, database credentials, JWT secrets, API keys, tokens, and other private configuration must never be committed to Git.

## Database

CareerForge uses MySQL with Sequelize.

Database schema changes are managed through Sequelize migrations.

Development migrations:

```bash
npm run db:migrate
```

Test database migrations:

```bash
npm run db:migrate:test
```

Development and test environments use separate database configuration.

## File Uploads

CareerForge uses Multer and Cloudinary for applicable file and image upload workflows.

Supported functionality includes:

- Profile images
- Resumes
- Documents

Cloudinary credentials are stored through environment configuration and remain outside source control.

## Transactional Email

CareerForge uses the Brevo Transactional Email API.

Email functionality is used for supported account workflows such as:

- Email verification
- Password-related communication
- Other authentication-related notifications

Brevo credentials remain outside source control.

## Local Development

### Prerequisites

Install:

- Node.js
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/chandu7000/Job-Recruitment-And-Application-Management-System.git
```

Enter the project:

```bash
cd "Job-Recruitment-And-Application-Management-System"
```

### 2. Backend Setup

Enter the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm ci
```

Use:

```text
.env.example
```

as the reference for local environment configuration.

Create the development and test databases and run the required migrations.

Start the backend:

```bash
npm run dev
```

The default local backend URL is:

```text
http://localhost:5000
```

For detailed backend setup instructions, see:

```text
server/README.md
```

### 3. Frontend Setup

From the repository root:

```bash
cd client
```

Install dependencies:

```bash
npm ci
```

Use:

```text
.env.example
```

as the reference for frontend environment configuration.

Start the frontend:

```bash
npm run dev
```

For detailed frontend information, see:

```text
client/README.md
```

## Environment Configuration

Environment-specific configuration must remain outside source control.

The project provides secret-free examples:

```text
client/.env.example
server/.env.example
```

The frontend API URL is configured using:

```text
VITE_API_BASE_URL
```

Backend environment configuration includes database settings, authentication secrets, cookies, frontend origins, Cloudinary, and Brevo.

Detailed backend environment documentation is available in:

```text
server/src/docs/ENVIRONMENT_VARIABLES.md
```

## Testing

CareerForge contains automated frontend and backend tests.

### Frontend

Current verified frontend result:

```text
59/59 test files passed
225/225 tests passed
ESLint passed
Production build passed
```

Frontend tests cover areas such as:

- Authentication
- Routing
- Route guards
- Public jobs
- Job seeker workflows
- Recruiter workflows
- Applications
- Interviews
- Notifications
- Administrator functionality
- Validation
- API integration
- Responsive navigation
- Accessibility behavior

### Backend

Current verified backend result:

```text
107/107 test suites passed
1326/1326 tests passed
ESLint passed
```

Backend tests cover areas such as:

- Authentication
- Authorization
- Session behavior
- Jobs
- Companies
- Applications
- Saved jobs
- Interviews
- Notifications
- Recruiter functionality
- Administrator functionality
- Validation
- Security behavior
- API behavior
- Business rules

## Quality Commands

### Frontend

Run from `client/`:

```bash
npm run lint
npm test
npm run build
```

### Backend

Run from `server/`:

```bash
npm run lint
npm test
```

## CI/CD

CareerForge uses GitHub Actions for automated code validation.

The CI process checks areas such as:

- Dependency installation
- ESLint
- Automated tests
- Frontend production build

The workflows run against the GitHub repository and help verify changes before or during integration with the `main` branch.

The production application is connected to the `main` branch for deployment.

High-level flow:

```text
Code Changes
     |
     v
Git Commit
     |
     v
GitHub
     |
     v
GitHub Actions
     |
     v
Validated main
     |
     +----------------+
     |                |
     v                v
  Vercel            Render
 Frontend           Backend
```

## Production Deployment

### Frontend

Platform:

```text
Vercel
```

Production application:

```text
https://job-recruitment-and-application-man.vercel.app
```

The frontend uses environment-based configuration to communicate with the production backend.

SPA routing is configured using:

```text
client/vercel.json
```

### Backend

Platform:

```text
Render
```

Production backend:

```text
https://job-recruitment-and-application.onrender.com
```

Health endpoint:

```text
https://job-recruitment-and-application.onrender.com/api/health
```

Readiness endpoint:

```text
https://job-recruitment-and-application.onrender.com/api/health/ready
```

Production configuration includes:

- HTTPS
- MySQL connectivity
- CORS configuration
- Secure authentication cookies
- Environment-based secrets
- Cloudinary
- Brevo
- Production logging
- Health and readiness checks

## Production Verification

The deployed application has been manually checked across important workflows.

Verified areas include:

- Frontend loading
- Frontend and backend communication
- Login and logout
- Session restoration
- Role-based access
- Protected routes
- Invalid credential handling
- Public jobs
- Search and filters
- Pagination
- Job details
- Company information
- Profile management
- Profile image upload
- Resume and document upload
- Saved jobs
- Job applications
- Application tracking
- Application withdrawal
- Interview scheduling
- Candidate interview actions
- Interview rescheduling
- Recruiter workflows
- Notifications
- Administrator workflows
- File persistence
- Transactional email
- CORS
- HTTPS
- Secure authentication cookies
- Responsive UI
- Multi-tab session behavior

## API Documentation

Backend API and technical documentation is available in:

```text
server/src/docs/
```

Important files include:

```text
API.md
API_CONTRACT.md
ARCHITECTURE.md
ENDPOINT_INVENTORY.md
ENVIRONMENT_VARIABLES.md
FRONTEND_API_HANDOFF.md
MODEL_INVENTORY.md
PRODUCTION_CONFIGURATION.md
TEST-DATA-STRATEGY.md
TESTING.md
```

The API documentation covers routes, request and response formats, authentication, authorization, validation, pagination, and important business rules.

## Known Limitation

The current frontend production build may show a Vite warning because the main JavaScript bundle is larger than 500 kB after minification.

This does not prevent the application from building or running successfully.

Bundle splitting and lazy loading can be considered as future performance improvements.

## Future Improvements

Possible future improvements include:

- Frontend bundle splitting
- Lazy loading
- Additional accessibility testing
- End-to-end browser testing
- Additional production monitoring
- Performance optimization
- Expanded analytics and reporting
- Visual regression testing
- Further UI/UX improvements

These are optional improvements and are not required for the current planned project scope.

## Project Status

CareerForge is complete for the planned project scope.

Completed areas include:

- Backend implementation
- Frontend implementation
- Database integration
- Authentication and authorization
- Public job discovery
- Job seeker workflows
- Recruiter workflows
- Administrator workflows
- Company management
- Job management
- Applications and saved jobs
- Interview management
- Notifications
- Reporting and moderation
- File uploads
- Transactional email
- Frontend automated testing
- Backend automated testing
- Frontend production build
- Frontend production deployment
- Backend production deployment
- Frontend and backend production integration
- CI/CD
- API integration
- Documentation
- Production verification

## Related Documentation

Frontend documentation:

```text
client/README.md
```

Backend documentation:

```text
server/README.md
```

Additional backend documentation:

```text
server/src/docs/
```

## About This Project

CareerForge was built as a full-stack portfolio project to apply and demonstrate practical software development concepts.

The project demonstrates experience with:

- React frontend development
- Node.js and Express backend development
- REST API development and integration
- MySQL and Sequelize
- Authentication and authorization
- Role-based application workflows
- File uploads
- Transactional email
- Automated testing
- Security practices
- Git and GitHub
- CI/CD
- Production deployment

The project is intended to demonstrate skills relevant to **entry-level and junior full-stack or backend software development roles**.

## Security Notice

Never commit:

- Production passwords
- Database credentials
- JWT secrets
- Cloudinary credentials
- Brevo credentials
- Private API keys
- Access tokens
- Refresh tokens
- Other sensitive production configuration

Use the provided `.env.example` files as references and keep real configuration in local or deployment-platform environment settings.