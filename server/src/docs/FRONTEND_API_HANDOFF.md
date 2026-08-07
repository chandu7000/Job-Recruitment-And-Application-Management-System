# CareerForge Frontend API Handoff

Status: **Stage 1 structure prepared; production URL and production smoke-test evidence remain pending Stages 4-5.**

## Base URLs
- Local: `http://localhost:5000`
- Production: `PENDING_STAGE_4_DEPLOYMENT`

## Authentication
Use the existing registration/login/verification endpoints in the frozen endpoint inventory. Send access tokens as `Authorization: Bearer <token>`. The refresh token is maintained as an HTTP-only cookie and must not be read by frontend JavaScript. Credentialed cross-origin requests must use the backend-approved origin and include credentials where the refresh cookie is required.

## Roles
Exactly: `JOB_SEEKER`, `RECRUITER`, `ADMIN`. No public ADMIN registration exists.

## Frozen references
- Complete endpoints: `ENDPOINT_INVENTORY.md`
- API/security behavior: `API.md`
- Models: `MODEL_INVENTORY.md`
- Frozen contract statement: `API_CONTRACT.md`

## Final Stage 5 sections to certify
Request schemas, response schemas, status/error codes, pagination/filter/sort rules, status enums and transition rules, upload rules, production CORS/cookie requirements, production URL, and safe example users will be finalized from the locked implementation and production smoke tests.
