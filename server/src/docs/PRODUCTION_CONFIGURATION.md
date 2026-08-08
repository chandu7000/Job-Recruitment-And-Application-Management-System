# CareerForge Backend

# CareerForge Production Configuration

## Overview

This document describes the final verified production deployment configuration for the CareerForge backend.

Production secrets must never be exposed in Git, documentation, logs, or source code.

---

# Deployment Platform

Backend Hosting

- Render Web Service

Production Backend URL

- https://job-recruitment-and-application.onrender.com

Database

- Managed MySQL 8 (External Provider)

File Storage

- Cloudinary

Email Service

- Brevo Transactional Email API

---

# Production Environment Variables

Production values must be configured only through the Render Environment Variables dashboard.

Never commit real production credentials into Git.

Required variables:

## Application

- NODE_ENV
- PORT

## Database

- DB_HOST
- DB_PORT
- DB_NAME
- TEST_DB_NAME
- DB_USER
- DB_PASSWORD

## Client and CORS

- CLIENT_ORIGIN
- CLIENT_URL

## JWT

- JWT_ACCESS_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRES_IN

## Cloudinary

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_PROFILE_IMAGE_FOLDER
- CLOUDINARY_RESUME_FOLDER
- CLOUDINARY_COMPANY_LOGO_FOLDER

## Brevo Transactional Email

- BREVO_API_KEY
- BREVO_SENDER_EMAIL

## Global Rate Limiting

- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS

## Authentication Rate Limits

- LOGIN_RATE_LIMIT_WINDOW_MINUTES
- LOGIN_RATE_LIMIT_MAX_REQUESTS
- REGISTER_RATE_LIMIT_WINDOW_MINUTES
- REGISTER_RATE_LIMIT_MAX_REQUESTS
- FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES
- FORGOT_PASSWORD_RATE_LIMIT_MAX_REQUESTS
- RESET_PASSWORD_RATE_LIMIT_WINDOW_MINUTES
- RESET_PASSWORD_RATE_LIMIT_MAX_REQUESTS
- EMAIL_VERIFICATION_RATE_LIMIT_WINDOW_MINUTES
- EMAIL_VERIFICATION_RATE_LIMIT_MAX_REQUESTS
- REFRESH_TOKEN_RATE_LIMIT_WINDOW_MINUTES
- REFRESH_TOKEN_RATE_LIMIT_MAX_REQUESTS

## Sensitive Route Limits

- REPORT_RATE_LIMIT_WINDOW_MINUTES
- REPORT_RATE_LIMIT_MAX_REQUESTS
- UPLOAD_RATE_LIMIT_WINDOW_MINUTES
- UPLOAD_RATE_LIMIT_MAX_REQUESTS

---

# JWT Requirements

Production JWT secrets must:

- contain at least 32 characters
- be cryptographically random
- use different access-token and refresh-token secrets
- never be committed to Git
- never appear in documentation

---

# Production Email

CareerForge production transactional email uses the Brevo API.

Required configuration:

- BREVO_API_KEY
- BREVO_SENDER_EMAIL

The API key must be stored only in the production environment.

The sender email must be an approved/verified Brevo sender.

Production email delivery has been successfully verified.

Do not commit the Brevo API key to Git.

---

# CORS

Production allows only trusted frontend origins.

Allowed origins are configured using:

CLIENT_ORIGIN

Wildcard (*) origins must not be used with credentialed production authentication.

The following development frontend origin has been production-tested:

http://localhost:5173

Allowed-origin behavior has been verified successfully.

An unauthorized origin was also tested and correctly rejected with:

403 CORS_ORIGIN_NOT_ALLOWED

When the production frontend is deployed, its exact production origin must be added to CLIENT_ORIGIN.

---

# Cookies

Production authentication cookies use secure configuration.

The refresh-token cookie has been verified with:

- HttpOnly enabled
- Secure enabled
- restricted authentication path
- production HTTPS transport

The refresh-token flow and token rotation have been successfully verified against the deployed backend.

---

# Cloudinary

Cloudinary provides production file storage.

Production verification completed for:

- Job-seeker profile image upload
- Job-seeker resume upload

Profile-image uploads support:

- JPG/JPEG
- PNG
- WEBP
- maximum size 5 MB

Resume uploads support:

- PDF
- DOC
- DOCX
- maximum size 10 MB

Production Cloudinary URLs and public IDs were successfully generated during deployment smoke testing.

---

# Logging

Production logging must:

- record useful request information
- support request/audit investigation
- never log passwords
- never log JWT access tokens
- never log refresh tokens
- never expose production secrets

Render production logging has been verified.

Successful authentication, health and upload requests were visible in the production logs.

---

# Error Handling

Production errors must:

- return structured client-safe responses
- avoid exposing stack traces
- avoid exposing SQL/database errors
- avoid exposing internal file paths
- avoid exposing secrets

Production-safe error handling was verified using an invalid route.

The backend correctly returned a structured ROUTE_NOT_FOUND response without exposing internal implementation details.

---

# Health Endpoint

GET /api/health

Production URL:

https://job-recruitment-and-application.onrender.com/api/health

Purpose:

Returns application health status.

Production verification:

- HTTP 200
- status UP

---

# Readiness Endpoint

GET /api/health/ready

Production URL:

https://job-recruitment-and-application.onrender.com/api/health/ready

Purpose:

Verifies backend readiness including database connectivity.

Production verification:

- HTTP 200
- status READY
- application UP
- database UP

---

# Database Migration

Production migration process:

1. Configure production environment variables.
2. Connect the managed production MySQL database.
3. Execute:

npm run db:migrate

4. Verify migration success.
5. Deploy/start the backend.
6. Verify the readiness endpoint.

Production migrations have been successfully completed.

---

# Deployment and Restart Verification

The backend is deployed using Render.

Production deployment URL:

https://job-recruitment-and-application.onrender.com

Manual redeployment using the latest committed version was successfully tested.

After redeployment, the backend returned to the Live state and:

GET /api/health

returned HTTP 200 with status UP.

This confirms production restart/redeploy behavior.

---

# Production Verification Checklist

- Render deployment configured — VERIFIED
- Managed production MySQL connected — VERIFIED
- Production migrations completed — VERIFIED
- Strong production JWT configuration — VERIFIED
- Cloudinary configured — VERIFIED
- Profile-image upload — VERIFIED
- Resume upload — VERIFIED
- Brevo transactional email — VERIFIED
- Trusted-origin CORS — VERIFIED
- Unauthorized-origin rejection — VERIFIED
- HTTP-only refresh cookie — VERIFIED
- Secure production cookie — VERIFIED
- Authentication — VERIFIED
- Refresh-token behavior — VERIFIED
- Production logging — VERIFIED
- Production-safe errors — VERIFIED
- Health endpoint — VERIFIED
- Readiness endpoint — VERIFIED
- Restart/redeploy behavior — VERIFIED

---

# Security Checklist

- Production secrets stored outside Git
- HTTPS enabled
- Secure cookies enabled
- HTTP-only refresh token enabled
- Strong JWT secrets configured
- Trusted-origin CORS configured
- Cloudinary production storage configured
- Brevo transactional email configured
- Managed MySQL configured
- Production-safe errors verified
- Production logging verified
- Health endpoint verified
- Readiness endpoint verified

---

# Final Notes

This document intentionally contains no real production credentials.

All sensitive production values are managed through environment variables.

CareerForge production configuration and deployment have been verified successfully.