# CareerForge API Reference

Base URL: `http://localhost:5000`

Authentication uses Bearer access tokens and an HTTP-only refresh-token cookie. Role and ownership checks are enforced by backend middleware/services.

## Endpoint inventory

The frozen Stage 1 inventory contains **138 mounted endpoints**. See [`ENDPOINT_INVENTORY.md`](./ENDPOINT_INVENTORY.md) for the complete method/path/source table.

## Roles and ownership

- `JOB_SEEKER`: owns profile, saved jobs, applications, interviews, sessions and notifications.
- `RECRUITER`: owns recruiter profile, company, company jobs, applicants and recruiter-managed interviews.
- `ADMIN`: uses explicit moderation and audit routes.
- Client-supplied user IDs, role values and ownership identifiers are never trusted without server-side validation.

## Status and transition rules

User, company, job, application, interview and report transitions are validated by the corresponding constants/utilities/services. Invalid transitions return controlled machine-readable conflict errors.

## Query parameters

List/search endpoints validate pagination, filters and sorting. Invalid values return a controlled validation response rather than being passed unchecked to Sequelize.

## Security behavior

- Helmet-compatible security headers and disabled `x-powered-by`.
- Trusted-origin CORS with credentials.
- 1 MB JSON and URL-encoded body limits.
- Global and sensitive-route rate limits.
- Dangerous/internal object-key and request-complexity protection.
- JWT algorithm restrictions and production-secret validation.
- Production stack traces are hidden.
- The global response sanitizer remains intentionally disabled because existing controllers/services shape responses safely.
