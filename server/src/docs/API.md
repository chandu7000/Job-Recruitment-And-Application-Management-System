# CareerForge API Reference

CareerForge provides a REST API for job seekers, recruiters and administrators.

## Base URLs

Local development:

`http://localhost:5000`

Production:

`https://job-recruitment-and-application.onrender.com`

All application endpoints are mounted under `/api`.

## Authentication

Authentication uses:

- Bearer JWT access tokens
- HTTP-only refresh-token cookies
- Role-based authorization
- Server-side ownership validation

Protected requests use:

`Authorization: Bearer <accessToken>`

Refresh authentication uses the secure HTTP-only `refreshToken` cookie.

## Endpoint Inventory

The frozen CareerForge backend contains **138 mounted endpoints**.

See [`ENDPOINT_INVENTORY.md`](./ENDPOINT_INVENTORY.md) for the complete method, path and source reference.

## Roles and Ownership

- `JOB_SEEKER`: owns profile, saved jobs, applications, interviews, sessions and notifications.
- `RECRUITER`: owns recruiter profile, company, company jobs, applicants and recruiter-managed interviews.
- `ADMIN`: uses explicit administration, moderation and audit functionality.

Client-supplied user IDs, role values and ownership identifiers are never trusted without server-side validation.

## Status and Transition Rules

User, company, job, application, interview and report transitions are validated by the corresponding constants, utilities and services.

Invalid transitions return controlled machine-readable conflict responses.

## Query Parameters

List and search endpoints validate:

- Pagination
- Filters
- Sorting
- Supported query values

Invalid values return controlled validation responses rather than being passed unchecked to Sequelize.

## Security Behavior

CareerForge backend security includes:

- Security headers
- Disabled `x-powered-by`
- Trusted-origin CORS with credentials
- 1 MB JSON and URL-encoded body limits
- Global rate limiting
- Sensitive-route rate limiting
- Authentication-specific rate limiting
- Request-complexity protection
- Dangerous/internal object-key protection
- JWT algorithm restrictions
- Strong production JWT-secret validation
- Secure HTTP-only refresh-token cookies
- Production-safe error responses
- Hidden production stack traces
- Server-side authorization and ownership enforcement

The global response sanitizer remains intentionally disabled because existing controllers and services explicitly shape API responses.

## File Uploads

CareerForge uses Cloudinary for production file storage.

Supported job-seeker uploads include:

### Profile Images

Supported formats:

- JPG/JPEG
- PNG
- WEBP

Maximum size:

`5 MB`

### Resumes

Supported formats:

- PDF
- DOC
- DOCX

Maximum size:

`10 MB`

## Transactional Email

Production transactional email is provided through the Brevo API.

Email functionality includes authentication and application-related notification workflows implemented by the backend.

Production credentials are supplied only through secure environment variables.

## Health Monitoring

Health:

`GET /api/health`

Readiness:

`GET /api/health/ready`

The readiness endpoint verifies application and database availability.

## API Contract

The CareerForge backend API contract is frozen for frontend integration.

See:

`FRONTEND_API_HANDOFF.md`

for frontend-specific endpoint integration guidance.

Future API changes should be explicitly required, reviewed, tested and documented.