# CareerForge Production Smoke Test Report

## Overview

This document records the production smoke-test verification completed for the CareerForge backend.

Production Backend:

`https://job-recruitment-and-application.onrender.com`

The deployed backend was verified for application availability, database connectivity, authentication, secure cookies, transactional email, file uploads, CORS, logging, safe error handling and deployment restart behavior.

---

## 1. Production Deployment

Platform:

- Render Web Service

Verified:

- Backend deployed successfully
- HTTPS available
- Application reached Live state
- Production environment variables configured
- Application started successfully

Result: **PASS**

---

## 2. Production Database

Database:

- Managed MySQL 8

Verified:

- Production database connection successful
- Sequelize connected successfully
- Production migrations completed
- Application can access production data
- Database readiness check successful

Result: **PASS**

---

## 3. Health Endpoint

Endpoint:

`GET /api/health`

Production endpoint:

`https://job-recruitment-and-application.onrender.com/api/health`

Verified:

- HTTP 200
- Application status `UP`

Result: **PASS**

---

## 4. Readiness Endpoint

Endpoint:

`GET /api/health/ready`

Production endpoint:

`https://job-recruitment-and-application.onrender.com/api/health/ready`

Verified:

- HTTP 200
- Status `READY`
- Application `UP`
- Database `UP`

Result: **PASS**

---

## 5. Authentication

Production authentication was tested against the deployed backend.

Verified:

- Login request successful
- Access token generated
- Authenticated API access successful
- Authentication middleware working

Result: **PASS**

---

## 6. Refresh Token

The production refresh-token workflow was tested.

Verified:

- Refresh-token cookie created
- Refresh request successful
- Access-token renewal successful
- Refresh-token behavior operational

Result: **PASS**

---

## 7. Production Cookie Security

The production refresh-token cookie was inspected.

Verified:

- `HttpOnly` enabled
- `Secure` enabled
- Authentication-scoped path configured
- HTTPS transport used

Result: **PASS**

---

## 8. Transactional Email

Provider:

- Brevo Transactional Email API

Verified:

- Production Brevo configuration operational
- Sender configuration operational
- Verification email successfully received
- Verification link successfully generated

Result: **PASS**

---

## 9. Cloudinary Profile Image Upload

Endpoint:

`POST /api/job-seeker/uploads/profile-image`

Verified:

- Authenticated request accepted
- Multipart upload successful
- Image stored in Cloudinary
- Cloudinary resource URL generated
- Cloudinary public ID generated

Supported formats:

- JPG/JPEG
- PNG
- WEBP

Maximum size:

`5 MB`

Result: **PASS**

---

## 10. Cloudinary Resume Upload

Endpoint:

`POST /api/job-seeker/uploads/resume`

Verified:

- Authenticated request accepted
- Multipart upload successful
- Resume stored in Cloudinary
- Cloudinary resource URL generated
- Cloudinary public ID generated
- Original filename stored correctly

Supported formats:

- PDF
- DOC
- DOCX

Maximum size:

`10 MB`

Result: **PASS**

---

## 11. Allowed-Origin CORS

Tested Origin:

`http://localhost:5173`

Request:

`GET /api/health`

Verified:

- Trusted origin accepted
- HTTP 200 returned

Result: **PASS**

---

## 12. Blocked-Origin CORS

An unauthorized origin was intentionally tested.

Verified:

- Request rejected
- HTTP 403 returned
- Error code `CORS_ORIGIN_NOT_ALLOWED`

Result: **PASS**

---

## 13. Production Logging

Render production logs were inspected.

Verified production activity included:

- Successful login requests
- Successful health requests
- Successful profile-image upload
- Successful resume upload
- Authentication audit activity

No production credentials are intentionally logged.

Result: **PASS**

---

## 14. Production-Safe Error Handling

An invalid production route was intentionally requested.

Verified response:

- HTTP 404
- Structured JSON error
- `ROUTE_NOT_FOUND`
- Request ID returned
- Timestamp returned

Verified that the response did not expose:

- Stack traces
- SQL/database details
- Internal file paths
- Production credentials
- Application secrets

Result: **PASS**

---

## 15. Restart and Redeploy Behavior

A manual deployment of the latest committed backend version was performed through Render.

After redeployment:

- Deployment completed successfully
- Service returned to Live state
- Application restarted successfully
- `GET /api/health` returned HTTP 200
- Application status returned `UP`

Result: **PASS**

---

## 16. Automated Verification Baseline

Final backend automated verification baseline:

- Unit suites: 69 passed
- Unit tests: 901 passed
- Integration suites: 35 passed
- Integration tests: 383 passed
- Total suites: 104 passed
- Total tests: 1284 passed
- Snapshots: 0
- ESLint errors: 0

Result: **PASS**

---

## 17. CI Verification

GitHub Actions backend CI is configured for automated backend verification.

CI validation includes:

- Dependency installation
- MySQL test environment
- Test database migrations
- ESLint
- Unit tests
- Integration tests

Result: **PASS**

---

## Final Smoke-Test Summary

| Verification | Result |
|---|---|
| Production deployment | PASS |
| Production MySQL | PASS |
| Production migrations | PASS |
| Health endpoint | PASS |
| Readiness endpoint | PASS |
| Authentication | PASS |
| Refresh-token flow | PASS |
| HTTP-only cookie | PASS |
| Secure cookie | PASS |
| Brevo transactional email | PASS |
| Cloudinary profile image | PASS |
| Cloudinary resume | PASS |
| Allowed-origin CORS | PASS |
| Blocked-origin CORS | PASS |
| Production logging | PASS |
| Production-safe errors | PASS |
| Restart/redeploy behavior | PASS |
| Automated tests | PASS |
| ESLint | PASS |
| GitHub Actions CI | PASS |

---

## Final Result

**PRODUCTION SMOKE TEST: PASSED**

CareerForge backend has successfully completed the required production smoke-test verification.

Production Backend:

`https://job-recruitment-and-application.onrender.com`

The backend is operational and ready for frontend integration.