# CareerForge Backend

Production-oriented backend API for the CareerForge Job Recruitment and Application Management System.

## Stack

Node.js 20+, Express 5, JavaScript ES modules, MySQL 8, Sequelize, JWT, HTTP-only cookies, bcrypt, Express Validator, Helmet, CORS, Multer, Cloudinary, Brevo Transactional Email API, Jest, Supertest and ESLint.

## Backend Structure

The CareerForge backend follows a layered architecture that separates routing, request handling, business logic, validation, data access, persistence, and shared infrastructure.

```text
src/
├── config/
├── constants/
├── controllers/
├── docs/
├── middleware/
├── migrations/
├── models/
├── repositories/
├── routes/
├── seeders/
├── services/
├── tests/
├── utils/
├── validators/
└── app.js
```

### `config/`

Contains backend configuration such as database connectivity and environment-dependent application configuration.

### `constants/`

Contains shared application constants, statuses, limits, enumerations, and reusable backend values.

### `controllers/`

Contains HTTP request handlers.

Controllers receive validated requests, invoke the appropriate service-layer functionality, and return API responses.

### `docs/`

Contains detailed backend technical documentation, including:

- API documentation
- API contracts
- Architecture information
- Endpoint inventories
- Environment-variable documentation
- Frontend API handoff information
- Model inventories
- Production configuration
- Testing documentation
- Test-data strategy

### `middleware/`

Contains reusable Express middleware for cross-cutting request concerns such as:

- Authentication
- Authorization
- Error handling
- Request validation
- Security
- File handling
- Request processing

### `migrations/`

Contains Sequelize database migrations used to create and evolve the CareerForge database schema.

### `models/`

Contains Sequelize model definitions and associations representing CareerForge database entities.

### `repositories/`

Contains the data-access layer.

Repositories isolate database queries and persistence operations from higher-level business logic.

### `routes/`

Contains Express route definitions that map CareerForge API endpoints to middleware, validators, and controllers.

### `seeders/`

Contains database seed operations used where controlled initial or test-oriented data is required.

### `services/`

Contains the primary business-logic layer.

Services coordinate:

- Application business rules
- Authorization requirements
- Repository operations
- Notifications
- Transactional email
- File-related workflows
- Domain-specific processing

### `tests/`

Contains automated backend tests, including unit and integration coverage for:

- Authentication
- Authorization
- API behavior
- Validation
- Business rules
- Security behavior
- Job-seeker workflows
- Recruiter workflows
- Administrator workflows
- Applications
- Saved jobs
- Interviews
- Notifications
- Reporting and moderation

### `utils/`

Contains reusable backend utility functions and domain helpers shared across application modules.

### `validators/`

Contains request and domain validation logic used to validate incoming data before business operations are performed.

### Application Entry Point

`app.js` configures the Express application, middleware, API routing, and application-level behavior.

## Backend Layering

The primary backend request flow follows this structure:

```text
HTTP Request
     |
     v
Routes
     |
     v
Middleware / Validators
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

This layered structure keeps HTTP concerns, validation, business rules, and database access separated and maintainable.

## Local Setup

1. Install Node.js 20+ and MySQL 8.
2. From `server`, run `npm install`.
3. Copy `.env.example` to `.env` and replace local placeholders.
4. Create the development and test databases named by `DB_NAME` and `TEST_DB_NAME`.
5. Run `npm run db:migrate`.
6. Run `npm run db:migrate:test`.
7. Run `npm run lint`.
8. Run `npm test`.
9. Start development with `npm run dev` or production-style local execution with `npm start`.

Default local base URL:

```text
http://localhost:5000
```

## Environment Configuration

Use:

```text
.env.example
```

as the secret-free reference for backend environment configuration.

Create a local:

```text
.env
```

for development and provide the required environment-specific values.

Production credentials and secrets must be configured through the deployment platform and must never be committed to source control.

Environment configuration includes areas such as:

- Application environment
- Server configuration
- Database configuration
- Authentication secrets
- Cookie configuration
- Frontend origin configuration
- Cloudinary integration
- Brevo transactional email configuration

Detailed environment-variable documentation is maintained in:

```text
src/docs/ENVIRONMENT_VARIABLES.md
```

## Database

CareerForge uses MySQL with Sequelize.

Database schema changes are managed through Sequelize migrations.

Development migrations:

```bash
npm run db:migrate
```

Test migrations:

```bash
npm run db:migrate:test
```

Database seed and migration commands are maintained through the backend package scripts.

## Authentication

CareerForge provides a complete authentication and account-security lifecycle.

Authentication functionality includes:

- Registration
- Email verification
- Verification resend
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

Production authentication cookies use secure production configuration appropriate for the deployed frontend and backend.

## Authorization

Backend authorization protects role-specific and resource-specific operations.

CareerForge supports:

- Job seeker access
- Recruiter access
- Administrator access
- Ownership validation
- Resource-level authorization
- Protected application operations
- Protected interview operations
- Protected company and job management
- Administrative moderation permissions

## Core Backend Functional Areas

The backend supports the complete CareerForge recruitment lifecycle.

### Public Jobs

- Public job listings
- Search
- Filtering
- Sorting
- Pagination
- Job details
- Company information
- Similar jobs

### Job Seeker

- Profile management
- Profile image management
- Resume/document management
- Job preferences
- Saved jobs
- Applications
- Application tracking
- Application withdrawal
- Application history
- Interview management
- Notifications

### Recruiter

- Recruiter profile
- Company management
- Company verification workflow
- Job creation and management
- Job publishing and closing
- Applicant management
- Applicant details
- Resume access
- Recruiter notes
- Application status management
- Interview scheduling
- Interview rescheduling
- Interview management/history

### Administrator

- User management
- User details
- User enable/disable operations
- Job moderation
- Job removal/restoration
- Report management
- Company verification/rejection
- Audit logs
- Audit-log details
- Administrative moderation

## File Uploads

CareerForge uses Multer for upload handling and Cloudinary for applicable persistent file and image storage.

File-related functionality includes:

- Profile images
- Resumes/documents

Cloudinary credentials are configured through environment variables and must not be committed to source control.

## Transactional Email

CareerForge uses the Brevo Transactional Email API for applicable email workflows.

Email-related functionality supports account and authentication workflows such as verification and password-related communication.

Brevo credentials remain outside source control and are configured through environment variables.

## Security

Backend security includes:

- Password hashing
- JWT access authentication
- HTTP-only refresh-token cookies
- Secure production cookies
- Role-based authorization
- Resource ownership validation
- CORS protection
- Trusted-origin validation
- Request validation
- Rate limiting
- Production-safe error handling
- Environment-based secrets
- Session revocation
- Administrative audit logging
- Helmet security headers

Production credentials and secrets must never be committed to the repository.

## Testing

CareerForge contains backend unit and integration tests covering major application behavior.

Run the complete backend test suite:

```bash
npm test
```

Run ESLint:

```bash
npm run lint
```

The established backend quality gate is:

```text
106/106 test suites passed
1323/1323 tests passed
ESLint passed
```

Testing covers areas including:

- Authentication
- Authorization
- Job-seeker functionality
- Recruiter functionality
- Administrator functionality
- Jobs
- Companies
- Applications
- Saved jobs
- Interviews
- Notifications
- Reporting
- Validation
- Security rules
- API behavior
- Business logic

## Production Deployment

CareerForge backend is deployed on Render.

Production base URL:

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
- Production MySQL connectivity
- Environment-based secrets
- Approved frontend-origin CORS handling
- Secure authentication cookies
- Cloudinary integration
- Brevo transactional email
- Production logging
- Health checks
- Readiness checks

## Production Frontend

The production frontend is deployed on Vercel.

```text
https://job-recruitment-and-application-man.vercel.app
```

The backend accepts the approved production frontend origin according to its production CORS configuration.

## Backend Verification

Backend automated and production verification covers:

- Authentication and authorization
- Job-seeker functionality
- Recruiter functionality
- Administrator functionality
- Job and company management
- Applications and saved jobs
- Interview management
- Notifications
- Reporting and dashboards
- Cloudinary file uploads
- Brevo transactional email
- Production MySQL connectivity
- Database migrations
- CORS protection
- Secure authentication cookies
- Rate limiting
- Production-safe error handling
- Production logging
- Health and readiness checks

## API Documentation

Detailed backend documentation is maintained under:

```text
src/docs/
```

Important documents include:

- `API.md`
- `API_CONTRACT.md`
- `ARCHITECTURE.md`
- `ENDPOINT_INVENTORY.md`
- `ENVIRONMENT_VARIABLES.md`
- `FRONTEND_API_HANDOFF.md`
- `MODEL_INVENTORY.md`
- `PRODUCTION_CONFIGURATION.md`
- `TEST-DATA-STRATEGY.md`
- `TESTING.md`

## API Contract

The backend API contract is established and integrated with the CareerForge frontend.

Frontend integration follows the existing backend:

- Routes
- Request formats
- Response formats
- Authentication requirements
- Authorization rules
- Pagination behavior
- Business rules

Established backend contracts should not be changed unnecessarily.

## Documentation

Backend documentation is maintained through:

```text
README.md
src/docs/
```

Project-wide and frontend documentation is available through:

```text
../README.md
../client/README.md
```

## Backend Status

- Backend implementation - Complete
- Authentication and authorization - Complete
- Database integration - Complete
- Job-seeker functionality - Complete
- Recruiter functionality - Complete
- Administrator functionality - Complete
- Applications and saved jobs - Complete
- Interview management - Complete
- Notifications - Complete
- File uploads - Complete
- Transactional email - Complete
- Automated testing - Complete
- ESLint verification - Complete
- Production deployment - Complete
- Production verification - Complete
- API contract - Frozen