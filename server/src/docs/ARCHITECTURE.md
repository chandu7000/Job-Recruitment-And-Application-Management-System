# CareerForge Backend Architecture

CareerForge is a backend-only modular Express application using JavaScript ES modules, MySQL 8 and Sequelize. It intentionally remains a single deployable service; Phase 14 does not introduce microservices or new business features.

## Request flow

`Client -> Express app -> security/CORS/body/cookie middleware -> route -> authentication/authorization/validation -> controller -> service -> repository/Sequelize -> MySQL -> standardized response`

Cross-cutting services provide email, notifications, audit logging, uploads, security controls, session cleanup and job expiry.

## Main layers

- `src/routes`: HTTP route definitions and middleware composition.
- `src/controllers`: HTTP request/response orchestration.
- `src/services`: business workflows and transitions.
- `src/repositories`: persistence access where used.
- `src/models`: Sequelize models and associations.
- `src/validators`: request validation.
- `src/middlewares`: authentication, authorization, security, errors and request handling.
- `src/config`: environment, database, cookies, Cloudinary and upload configuration.
- `src/migrations`: ordered database schema changes.
- `src/tests`: Jest/Supertest unit and integration coverage.
- `src/docs`: testing, API, inventory, architecture and handoff documentation.

## Security baseline

The Phase 12 controls remain locked: trusted-origin CORS, secure production cookie behavior, Helmet-compatible headers, rate limits, request complexity/internal-field protection, HS256 JWT restrictions, strong production-secret validation, upload protection and production-safe errors. The global response sanitizer in `app.js` intentionally remains disabled.
