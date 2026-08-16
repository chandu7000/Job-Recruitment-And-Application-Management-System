# CareerForge Backend

CareerForge is a full-stack Job Recruitment and Application Management System built as a portfolio project to demonstrate practical full-stack development and backend engineering skills.

This directory contains the Node.js and Express backend of CareerForge.

The backend provides REST APIs for authentication, job management, applications, interviews, notifications, recruiter workflows, administrator functionality, file uploads, and other CareerForge features.

## Technology Stack

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

## Project Structure

The backend uses a layered structure to keep different responsibilities separated.

```text
server/
|-- migrations/
|-- seeders/
|-- src/
|   |-- config/
|   |-- constants/
|   |-- controllers/
|   |-- docs/
|   |-- middleware/
|   |-- models/
|   |-- repositories/
|   |-- routes/
|   |-- services/
|   |-- tests/
|   |-- utils/
|   |-- validators/
|   `-- app.js
|-- .env.example
|-- package.json
`-- README.md
```

### Folder Overview

`migrations/`  
Contains Sequelize migrations used to create and update the database structure.

`seeders/`  
Contains controlled database seed operations.

`src/config/`  
Contains database and application configuration.

`src/constants/`  
Contains shared constants, statuses, limits, and other reusable values.

`src/controllers/`  
Contains HTTP request handlers.

`src/docs/`  
Contains detailed backend documentation such as API information, architecture, testing, environment configuration, and production setup.

`src/middleware/`  
Contains Express middleware for authentication, authorization, validation, security, error handling, file processing, and other request-related behavior.

`src/models/`  
Contains Sequelize models and database relationships.

`src/repositories/`  
Contains database access logic.

`src/routes/`  
Contains REST API route definitions.

`src/services/`  
Contains the main business logic of the application.

`src/tests/`  
Contains backend unit and integration tests.

`src/utils/`  
Contains reusable backend helper functions.

`src/validators/`  
Contains request and domain validation logic.

`src/app.js`  
Configures the Express application, middleware, and API routes.

## Backend Architecture

A typical API request follows this flow:

```text
HTTP Request
     |
     v
Routes
     |
     v
Middleware / Validation
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
Sequelize Models
     |
     v
MySQL
```

This structure helps keep routing, validation, business logic, and database operations separated.

## Main Features

### Authentication and Account Management

- User registration
- Email verification
- Resend email verification
- Login
- JWT access-token authentication
- Refresh-token sessions
- Session restoration
- Logout
- Logout from all sessions
- Session management
- Session revocation
- Forgot password
- Reset password
- Change password
- Email change
- Role-based authorization

Refresh tokens are handled using HTTP-only cookies.

### Public Jobs

- Public job listings
- Job search
- Filtering and sorting
- Pagination
- Job details
- Company information
- Similar jobs

### Job Seekers

- Profile management
- Profile image management
- Resume and document management
- Job preferences
- Saved jobs
- Job applications
- Application tracking
- Application withdrawal
- Application history
- Interview management
- Notifications

### Recruiters

- Recruiter profile management
- Company management
- Company verification workflow
- Job creation and editing
- Job publishing and closing
- Applicant management
- Applicant details
- Resume access
- Recruiter notes
- Application status management
- Interview scheduling
- Interview rescheduling
- Interview history

### Administrators

- User management
- User details
- Enable and disable users
- Company verification and rejection
- Job moderation
- Job removal and restoration
- Report management
- Audit logs
- Audit log details
- Administrative moderation

## Database

CareerForge uses MySQL as the relational database and Sequelize as the ORM.

Database changes are managed using Sequelize migrations.

Run development migrations:

```bash
npm run db:migrate
```

Run test-database migrations:

```bash
npm run db:migrate:test
```

The development and test databases should use separate database names.

## File Uploads

CareerForge uses Multer for handling uploaded files and Cloudinary for applicable persistent file and image storage.

Supported workflows include:

- Profile images
- Resumes
- Documents

Cloudinary credentials are configured using environment variables and must not be committed to Git.

## Transactional Email

CareerForge uses the Brevo Transactional Email API for applicable email functionality.

Email is used for account-related workflows such as:

- Email verification
- Password-related communication
- Other supported authentication notifications

Brevo credentials are configured using environment variables and remain outside source control.

## Authentication and Security

The backend contains security features including:

- Password hashing
- JWT authentication
- HTTP-only refresh-token cookies
- Secure production cookies
- Role-based authorization
- Resource ownership validation
- Request validation
- CORS protection
- Trusted-origin validation
- Rate limiting
- Session revocation
- Helmet security headers
- Administrative audit logging
- Production-safe error handling
- Environment-based secrets

Real passwords, database credentials, JWT secrets, API keys, and other private configuration must never be committed to Git.

## Environment Configuration

Use:

```text
.env.example
```

as the reference for backend environment variables.

Create a local:

```text
.env
```

for development and provide the required values.

Environment configuration covers areas such as:

- Application environment
- Server port
- Database connection
- Authentication secrets
- Cookie configuration
- Frontend origin
- Cloudinary
- Brevo

Detailed information is available in:

```text
src/docs/ENVIRONMENT_VARIABLES.md
```

## Local Setup

### 1. Install Requirements

Install:

- Node.js 20+
- MySQL 8

### 2. Install Dependencies

From the `server` directory:

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example configuration:

```text
.env.example
```

and create your local `.env`.

### 4. Create Databases

Create the development and test databases configured through:

```text
DB_NAME
TEST_DB_NAME
```

### 5. Run Database Migrations

Development database:

```bash
npm run db:migrate
```

Test database:

```bash
npm run db:migrate:test
```

### 6. Start the Backend

Development:

```bash
npm run dev
```

Standard start:

```bash
npm start
```

The default local backend URL is:

```text
http://localhost:5000
```

## Testing

The backend contains unit and integration tests for important application behavior.

Testing covers areas such as:

- Authentication
- Authorization
- Validation
- Public jobs
- Companies
- Job seeker functionality
- Recruiter functionality
- Administrator functionality
- Applications
- Saved jobs
- Interviews
- Notifications
- Reporting
- Security behavior
- API behavior
- Business rules

Run all backend tests:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

Current verified backend test result:

```text
107/107 test suites passed
1326/1326 tests passed
ESLint passed
```

## API Documentation

Detailed backend documentation is available in:

```text
src/docs/
```

Important documentation includes:

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

These files provide additional information about API endpoints, architecture, environment configuration, testing, and frontend integration.

## API Integration

The backend REST API is integrated with the CareerForge React frontend.

The integration includes:

- API routes
- Request and response formats
- Authentication
- Authorization
- Pagination
- Validation
- Business rules
- Cookie-based session handling

The established API contract should remain stable unless a feature requires an intentional change.

## CI/CD

GitHub Actions is used to automatically check the backend code.

The backend CI process includes the configured automated quality checks for the project.

The production backend is deployed through Render from the GitHub repository.

## Production Deployment

The CareerForge backend is deployed on Render.

Production backend:

https://job-recruitment-and-application.onrender.com

Health endpoint:

https://job-recruitment-and-application.onrender.com/api/health

Readiness endpoint:

https://job-recruitment-and-application.onrender.com/api/health/ready

The production environment uses configuration for:

- HTTPS
- Production MySQL
- Environment-based secrets
- CORS
- Secure authentication cookies
- Cloudinary
- Brevo
- Production logging
- Health checks
- Readiness checks

## Production Frontend

The CareerForge frontend is deployed on Vercel.

Production application:

https://job-recruitment-and-application-man.vercel.app

The frontend communicates with this backend using its production API configuration.

## Project Status

The CareerForge backend is complete for the planned project scope.

Completed areas include:

- Backend implementation
- Database integration
- Authentication and authorization
- Job seeker functionality
- Recruiter functionality
- Administrator functionality
- Company and job management
- Applications and saved jobs
- Interview management
- Notifications
- File uploads
- Transactional email
- Security implementation
- Automated testing
- API integration
- CI/CD
- Production deployment
- Production verification

## Related Documentation

For complete project and frontend information, see:

```text
../README.md
../client/README.md
src/docs/
```

## About This Project

CareerForge was built as a full-stack portfolio project to apply and demonstrate practical backend and full-stack development concepts.

The backend demonstrates experience with REST API development, relational databases, authentication, authorization, layered application structure, validation, file uploads, transactional email, automated testing, security practices, CI/CD, and production deployment.

The project is intended to demonstrate skills relevant to entry-level and junior full-stack and backend software development roles.