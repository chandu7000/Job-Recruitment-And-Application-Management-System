# CareerForge Environment Variables

Use `server/.env.example` as the secret-free template. Real credentials must exist only in local `.env` files or deployment-platform secret storage.

## Required groups

- Runtime: `NODE_ENV`, `PORT`.
- MySQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `TEST_DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Frontend/CORS: `CLIENT_ORIGIN` (comma-separated allowed origins), `CLIENT_URL`.
- JWT: `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`. Production secrets must satisfy the validation in `src/config/env.js`.
- Cloudinary: cloud name, API key/secret, and the three configured folders.
- SMTP: host, port, user and password.
- Rate limits: global, login, register, forgot/reset password, email verification, refresh token, report and upload settings.
- Optional operational inputs: initial admin seeder credentials and job-expiry batch size.

Production values are completed in Phase 14 Stage 2; Stage 1 records the contract only.


---

# Production Environment Checklist

Before deploying CareerForge to production, verify the following:

## Application

- NODE_ENV=production
- PORT configured by hosting provider

## Database

- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD

## JWT

- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET

Both secrets must contain at least 32 random characters.

## Cloudinary

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_PROFILE_IMAGE_FOLDER
- CLOUDINARY_RESUME_FOLDER
- CLOUDINARY_COMPANY_LOGO_FOLDER

## SMTP

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD

## Frontend

- CLIENT_URL
- CLIENT_ORIGIN

## Rate Limits

Verify all rate limit variables are configured before deployment.

## Production Security

Before going live:

- Do not commit secrets.
- Use HTTPS.
- Configure Render environment variables.
- Verify database connectivity.
- Verify Cloudinary uploads.
- Verify SMTP email delivery.
- Verify health endpoint.
- Verify readiness endpoint.
- Run database migrations.