# CareerForge Backend
# Phase 14 — Production Configuration

## Overview

This document describes the production deployment configuration for the CareerForge backend.

Production deployment must never expose secrets in Git, documentation, or source code.

---

# Deployment Platform

Backend Hosting

- Render Web Service

Database

- Managed MySQL 8 (External Provider)

File Storage

- Cloudinary

Email Service

- SMTP Provider

---

# Production Environment Variables

The following values must be configured only inside the Render Environment Variables dashboard.

Never commit production credentials into Git.

Required variables:

- NODE_ENV
- PORT
- DB_HOST
- DB_PORT
- DB_NAME
- TEST_DB_NAME
- DB_USER
- DB_PASSWORD
- CLIENT_ORIGIN
- CLIENT_URL

JWT

- JWT_ACCESS_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRES_IN

Cloudinary

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_PROFILE_IMAGE_FOLDER
- CLOUDINARY_RESUME_FOLDER
- CLOUDINARY_COMPANY_LOGO_FOLDER

SMTP

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD

Rate Limiting

- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS

Authentication Rate Limits

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

Sensitive Route Limits

- REPORT_RATE_LIMIT_WINDOW_MINUTES
- REPORT_RATE_LIMIT_MAX_REQUESTS
- UPLOAD_RATE_LIMIT_WINDOW_MINUTES
- UPLOAD_RATE_LIMIT_MAX_REQUESTS

---

# JWT Requirements

Production JWT secrets must:

- contain at least 32 characters
- be cryptographically random
- never be committed to Git
- never appear in documentation

---

# CORS

Production must allow only trusted frontend origins.

Allowed origins are configured using:

CLIENT_ORIGIN

Do not use wildcard (*) origins in production.

---

# Cookies

Authentication cookies must be:

- HttpOnly
- Secure
- SameSite=None (HTTPS)

---

# Logging

Production logging should:

- record request information
- never log passwords
- never log JWT tokens
- never log refresh tokens
- never log sensitive personal information

---

# Error Handling

Production errors must:

- return generic client responses
- avoid exposing stack traces
- avoid exposing SQL errors
- avoid exposing internal file paths

---

# Health Endpoint

GET /api/health

Purpose:

Returns application health status.

---

# Readiness Endpoint

GET /api/health/ready

Purpose:

Verifies backend readiness including database connectivity.

---

# Database Migration

Production migration process:

1. Deploy backend.
2. Configure environment variables.
3. Connect production MySQL.
4. Execute:

npm run db:migrate

5. Verify migration success.
6. Start backend.

---

# Security Checklist

- Production secrets stored only in Render.
- HTTPS enabled.
- Secure cookies enabled.
- Strong JWT secrets.
- Cloudinary configured.
- SMTP configured.
- Database backups enabled.
- Health endpoint verified.
- Readiness endpoint verified.

---

# Final Notes

This document contains no production credentials.

All production configuration is performed using Render Environment Variables.