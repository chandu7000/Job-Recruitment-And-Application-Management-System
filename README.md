# CareerForge

CareerForge is a production-ready Job Recruitment and Application Management System designed to support job seekers, recruiters and administrators through a secure recruitment workflow.

The project provides authentication, role-based access control, job and company management, job-seeker profiles, applications, saved jobs, interview management, notifications, reporting, dashboards, file uploads and administrative management.

## Repository Structure

- `server/` — Node.js, Express and MySQL backend.
- `client/` — React frontend powered by Vite.

## Technology Stack

### Backend

- Node.js
- Express
- MySQL
- Sequelize
- JWT authentication
- HTTP-only refresh-token cookies
- bcrypt
- Express Validator
- CORS
- Multer
- Cloudinary
- Brevo Transactional Email API
- Jest
- Supertest
- ESLint

### Frontend

- React
- Vite
- ESLint

## Backend

The complete backend application is located in:

`server/`

For installation, environment configuration, database migrations, testing and backend documentation, see:

`server/README.md`

## Frontend

The frontend application is located in:

`client/`

The React/Vite project has been initialized and will integrate with the frozen CareerForge backend API contract.

## Production Backend

CareerForge backend is deployed on Render.

Production base URL:

https://job-recruitment-and-application.onrender.com

Health endpoint:

https://job-recruitment-and-application.onrender.com/api/health

Readiness endpoint:

https://job-recruitment-and-application.onrender.com/api/health/ready

## Backend Verification

The backend has completed automated and production verification covering:

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

Backend documentation is maintained under:

`server/src/docs/`

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

The backend API contract is frozen and ready for frontend integration.

Frontend development should integrate with the existing backend contract without unnecessarily changing established backend routes, request formats, response formats or business rules.

## Security

Production credentials and secrets are never committed to the repository.

Use:

`server/.env.example`

as the secret-free environment configuration reference.

Real production secrets must be stored using secure deployment-platform environment variables.

## Project Status

- Backend implementation — Complete
- Backend automated testing — Complete
- Production deployment — Complete
- Production verification — Complete
- API contract — Frozen
- Frontend project setup — Complete
- Frontend implementation — Next