# CareerForge Backend Architecture

CareerForge uses a modular monolithic backend architecture built with JavaScript ES modules, Node.js, Express, MySQL 8 and Sequelize.

The backend intentionally remains a single deployable service rather than a microservices architecture.

## Request Flow

`Client -> Express app -> security/CORS/body/cookie middleware -> route -> authentication/authorization/validation -> controller -> service -> repository/Sequelize -> MySQL -> standardized response`

Cross-cutting services provide:

- Authentication and session management
- Email delivery
- Notifications
- Audit logging
- Cloudinary file uploads
- Security controls
- Session cleanup
- Job expiry processing

## Main Layers

- `src/routes` — HTTP route definitions and middleware composition.
- `src/controllers` — HTTP request and response orchestration.
- `src/services` — business workflows and transition logic.
- `src/repositories` — persistence access where applicable.
- `src/models` — Sequelize models and associations.
- `src/validators` — request validation.
- `src/middlewares` — authentication, authorization, security, errors and request processing.
- `src/config` — environment, database, cookies, Cloudinary and application configuration.
- `src/migrations` — ordered database schema changes.
- `src/tests` — Jest/Supertest unit and integration coverage.
- `src/docs` — API, testing, architecture, inventory, production and frontend handoff documentation.

## Database Architecture

CareerForge uses MySQL 8 with Sequelize ORM.

Database changes are managed through ordered Sequelize migrations.

Separate databases are used for:

- Development
- Automated testing
- Production

Production uses a managed MySQL database.

## Authentication Architecture

Authentication uses:

- JWT access tokens
- Refresh tokens
- HTTP-only cookies
- Refresh-token rotation
- Session persistence
- Session revocation
- bcrypt password hashing
- Email verification
- Role-based authorization

Supported roles:

- `JOB_SEEKER`
- `RECRUITER`
- `ADMIN`

Authorization and ownership are enforced by the backend.

## File Storage

CareerForge uses Cloudinary for managed file storage.

Supported resources include:

- Job-seeker profile images
- Job-seeker resumes
- Company logos

Uploads are validated before being accepted.

## Email Architecture

Transactional email is delivered using the Brevo API.

Email delivery supports backend workflows including authentication, verification and recruitment-related notifications.

Email-provider failures are handled safely without exposing provider credentials or sensitive implementation details.

## Security Architecture

The backend security baseline includes:

- Trusted-origin CORS
- Secure production cookies
- HTTP-only refresh-token cookies
- Security headers
- Disabled `x-powered-by`
- Global rate limiting
- Authentication-specific rate limiting
- Sensitive-route rate limiting
- Request-complexity protection
- Dangerous/internal-field protection
- Mass-assignment protection
- HS256 JWT restrictions
- Strong production-secret validation
- Secure upload validation
- Production-safe error responses
- Database constraints and indexes
- Server-side authorization
- Ownership validation

The global response sanitizer in `app.js` intentionally remains disabled because existing controllers and services explicitly shape API responses.

## Testing Architecture

CareerForge uses:

- Jest
- Supertest
- Dedicated MySQL test database
- Unit tests
- Integration tests
- Migration verification
- ESLint

The locked automated verification baseline is:

- 69 unit suites
- 901 unit tests
- 35 integration suites
- 383 integration tests
- 104 total test suites
- 1284 total tests
- 0 snapshots
- 0 ESLint errors

## CI/CD

GitHub Actions provides automated backend verification.

The CI workflow performs:

- Dependency installation
- MySQL test-service setup
- Test database migrations
- ESLint validation
- Unit testing
- Integration testing
- Regression verification

## Production Architecture

The production backend is deployed as a Render Web Service.

Production services include:

- Render — application hosting
- Managed MySQL 8 — relational database
- Cloudinary — file storage
- Brevo — transactional email
- GitHub Actions — continuous integration

Production backend:

`https://job-recruitment-and-application.onrender.com`

## Architecture Principle

CareerForge follows a modular monolithic architecture with clear separation between HTTP handling, business logic, persistence, validation, security and infrastructure concerns.

The existing backend architecture and API contract are frozen for frontend integration and should not be redesigned without a justified, tested and documented requirement.