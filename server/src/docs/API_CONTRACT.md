# CareerForge Frozen Backend API Contract

Status: Production API contract frozen after final backend verification.

The implemented business and API behavior forms the locked production baseline.

Production deployment, CI/CD, and production smoke verification have been completed.

The CareerForge backend API contract is now frozen for frontend integration.

Do not change routes, controllers, services, models, migrations, statuses, ownership rules, request schemas or response behavior unless a future change is explicitly required, reviewed, tested and documented.

## Contract Sources

- Endpoint list: `ENDPOINT_INVENTORY.md`
- API behavior/security summary: `API.md`
- Frontend integration contract: `FRONTEND_API_HANDOFF.md`
- Models: `MODEL_INVENTORY.md`
- Tests: TESTING.md, PRODUCTION_SMOKE_TEST_REPORT.md, and PRODUCTION_VERIFICATION.md
- Route definitions: `src/routes/**`
- Validators/constants: `src/validators/**` and `src/constants/**`

## Base URLs

Local backend:

```text
http://localhost:5000